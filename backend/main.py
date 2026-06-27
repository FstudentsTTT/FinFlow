"""
FinFlow AI — FastAPI Application
Capital Routing Engine & Continuous B2B CFO SaaS for Uzbekistan SMEs
"""

import json
import os
import shutil
import uuid
from datetime import datetime, timezone
from pathlib import Path

import aiofiles
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from ai_prompt import FINANCIAL_ADVISORY_SYSTEM_PROMPT, build_user_message
from calculator import run_full_audit
from database import AuditLog, Setting, User, get_db, init_db
from gemini_service import AI_MODEL, AI_BASE_URL, GeminiError, GeminiNotConfigured, extract_financials_from_document, generate_advisory, generate_chat_response, get_gemini_key, set_gemini_key, validate_key
from models import BusinessProfile
from schemas import ChatRequest, LoginRequest, PublishFeedRequest, RegisterRequest, TokenResponse
from security import create_access_token, get_current_admin, get_current_user, hash_password, verify_password

# ── Uploads directory ──────────────────────────────────────────────────────────
UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# ── App bootstrap ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="FinFlow AI",
    description="Capital Routing Engine & Continuous B2B CFO SaaS for Uzbekistan SMEs",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@app.on_event("startup")
async def startup():
    init_db()
    _seed_admin()


def _seed_admin():
    from database import SessionLocal
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@finflow.uz").first()
        if admin is None:
            admin = User(
                email="admin@finflow.uz",
                full_name="FinFlow Admin",
                password_hash=hash_password("Admin@12345"),
                role="founder",
                is_admin=True,
                tax_status="VERIFIED",
            )
            db.add(admin)
            db.commit()
    finally:
        db.close()


# ── Health ─────────────────────────────────────────────────────────────────────

@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "operational",
        "service": "FinFlow AI",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ── Auth ───────────────────────────────────────────────────────────────────────

@app.post("/api/v1/auth/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=409, detail="Bu email allaqachon ro'yxatdan o'tgan")
    user = User(
        email=body.email,
        full_name=body.full_name,
        password_hash=hash_password(body.password),
        role=body.role,
        business_name=body.business_name,
        region=body.region,
        tax_status="UNVERIFIED",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user_id=user.id, email=user.email, is_admin=user.is_admin)
    return {"access_token": token, "token_type": "bearer", "user": user.to_public()}


@app.post("/api/v1/auth/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email yoki parol noto'g'ri")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Hisob o'chirilgan")
    token = create_access_token(user_id=user.id, email=user.email, is_admin=user.is_admin)
    return {"access_token": token, "token_type": "bearer", "user": user.to_public()}


@app.get("/api/v1/auth/me")
async def me(current_user: User = Depends(get_current_user)):
    return {"success": True, "user": current_user.to_public()}


# ── Audit ──────────────────────────────────────────────────────────────────────

@app.post("/api/v1/audit/calculate")
async def calculate_audit(
    profile: BusinessProfile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    results = run_full_audit(profile)
    results["audit_timestamp"] = datetime.now(timezone.utc).isoformat()
    return {"success": True, "data": results}


@app.post("/api/v1/audit/extract-document")
async def extract_from_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Yuklangan hujjatdan (PDF, Excel, CSV, TXT) moliyaviy ma'lumotlarni AI orqali ajratadi."""
    ALLOWED_TYPES = {
        "application/pdf", "text/plain", "text/csv",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
    }
    ALLOWED_EXT = {".pdf", ".txt", ".csv", ".xlsx", ".xls"}
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(
            status_code=400,
            detail=f"Qo'llab-quvvatlanadigan formatlar: PDF, Excel (.xlsx/.xls), CSV, TXT",
        )

    content = await file.read()

    text = ""
    try:
        if ext == ".pdf":
            import pdfplumber, io
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                text = "\n".join(
                    page.extract_text() or "" for page in pdf.pages
                )
        elif ext in (".xlsx", ".xls"):
            import openpyxl, io
            wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
            rows = []
            for sheet in wb.worksheets:
                for row in sheet.iter_rows(values_only=True):
                    cells = [str(c) for c in row if c is not None and str(c).strip()]
                    if cells:
                        rows.append("  ".join(cells))
            text = "\n".join(rows)
        elif ext == ".csv":
            import csv, io as _io
            text = content.decode("utf-8", errors="replace")
        else:
            text = content.decode("utf-8", errors="replace")
    except ImportError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Server {ext} faylini qayta ishlash uchun zarur kutubxona o'rnatilmagan: {exc}",
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Fayl o'qilmadi: {exc}")

    if not text or len(text.strip()) < 30:
        raise HTTPException(
            status_code=422,
            detail="Hujjatdan matn ajratib bo'lmadi. Fayl skanerdan olingan rasm bo'lsa, matnli PDF yuboring.",
        )

    try:
        extracted = extract_financials_from_document(text)
    except GeminiError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    # Qaysi maydonlar topilganini va topilmaganini aniqlash
    REQUIRED = ["annual_revenue", "annual_operating_expenses", "gross_monthly_payroll"]
    missing = [f for f in REQUIRED if not extracted.get(f)]

    feedback = []
    if missing:
        labels = {
            "annual_revenue": "Yillik daromad",
            "annual_operating_expenses": "Yillik operatsion xarajatlar",
            "gross_monthly_payroll": "Oylik ish haqi fondi",
        }
        feedback.append(
            "Hujjatda yetarli ma'lumot topilmadi. Qo'lda to'ldiring: "
            + ", ".join(labels[m] for m in missing)
        )

    monthly = extracted.get("monthly_revenues") or []
    if len(monthly) < 3:
        feedback.append("Oylik daromad trendi kamida 3 oy bo'lishi kerak — qo'lda kiriting.")

    return {
        "success": True,
        "data": extracted,
        "feedback": feedback,
        "fields_found": [k for k, v in extracted.items() if v is not None and v != []],
        "fields_missing": missing,
    }


@app.post("/api/v1/audit/advisory")
async def generate_advisory_endpoint(
    profile: BusinessProfile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    audit_results = run_full_audit(profile)
    audit_results["audit_timestamp"] = datetime.now(timezone.utc).isoformat()

    try:
        ai_result = generate_advisory(db, audit_results)
    except GeminiNotConfigured as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except GeminiError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    sqb = audit_results["sqb_debt_readiness_index"]
    dscr = audit_results["dscr_analysis"]

    log = AuditLog(
        user_id=current_user.id,
        business_name=profile.business_name,
        sector=profile.sector.value,
        region=profile.region.value,
        sqb_score=sqb["total_score"],
        sqb_rating=sqb["rating"],
        dscr_display=dscr["dscr_display"],
        badge_eligible=sqb["badge_eligible"],
        annual_revenue=profile.annual_revenue,
        total_tax_savings=audit_results["it_park_optimization"]["total_annual_savings"],
        audit_json=json.dumps(audit_results, ensure_ascii=False),
        advisory_json=json.dumps(ai_result["advisory"], ensure_ascii=False),
        ai_model=ai_result["model"],
    )
    db.add(log)

    current_user.last_sqb_score = sqb["total_score"]
    current_user.badge_verified = sqb["badge_eligible"]
    if profile.business_name:
        current_user.business_name = profile.business_name
    if profile.region:
        current_user.region = profile.region.value
    current_user.tax_status = "VERIFIED"

    db.commit()
    db.refresh(log)

    return {
        "success": True,
        "data": {
            "audit_log_id": log.id,
            "audit_results": audit_results,
            "advisory": ai_result["advisory"],
            "model": ai_result["model"],
            "usage": ai_result.get("usage", {}),
        },
    }


@app.get("/api/v1/audit/history")
async def audit_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    logs = (
        db.query(AuditLog)
        .filter(AuditLog.user_id == current_user.id)
        .order_by(AuditLog.created_at.desc())
        .limit(20)
        .all()
    )
    return {"success": True, "data": [l.to_dict() for l in logs]}


@app.get("/api/v1/audit/{log_id}")
async def get_audit(
    log_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log = db.query(AuditLog).filter(AuditLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Audit topilmadi")
    if log.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    return {"success": True, "data": log.to_dict(include_payloads=True)}


# ── Video upload ───────────────────────────────────────────────────────────────

@app.post("/api/v1/feed/upload-video")
async def upload_video(
    file: UploadFile = File(...),
    audit_log_id: int = Form(...),
    pitch_title: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log = db.query(AuditLog).filter(AuditLog.id == audit_log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Audit topilmadi")
    if log.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")

    if file.content_type not in ("video/mp4", "video/webm", "video/quicktime"):
        raise HTTPException(status_code=400, detail="Faqat MP4/WebM/MOV video formatida yuklang")

    ext = Path(file.filename).suffix or ".mp4"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / filename

    async with aiofiles.open(dest, "wb") as out:
        while chunk := await file.read(1024 * 1024):
            await out.write(chunk)

    log.video_filename = filename
    log.pitch_title = pitch_title.strip()[:160]
    db.commit()

    return {"success": True, "filename": filename, "pitch_title": log.pitch_title}


@app.post("/api/v1/feed/publish")
async def publish_to_feed(
    body: PublishFeedRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log = db.query(AuditLog).filter(AuditLog.id == body.audit_log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Audit topilmadi")
    if log.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    if not log.badge_eligible:
        raise HTTPException(status_code=403, detail="AI Verified Badge kerak (SQB balli 70+)")
    if not log.video_filename:
        raise HTTPException(status_code=400, detail="Avval video yuklang")

    log.published_to_feed = True
    log.pitch_title = body.pitch_title.strip()[:160]
    db.commit()
    return {"success": True, "message": "Angel Discovery Feed'ga muvaffaqiyatli nashr etildi"}


@app.get("/api/v1/feed")
async def angel_feed(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    items = (
        db.query(AuditLog)
        .filter(AuditLog.published_to_feed == True, AuditLog.badge_eligible == True)
        .order_by(AuditLog.sqb_score.desc(), AuditLog.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    result = []
    for item in items:
        d = item.to_dict(include_payloads=True)
        d["author"] = {"full_name": item.user.full_name, "region": item.user.region}
        result.append(d)
    return {"success": True, "data": result, "total": len(result)}


# ── AI CFO Agent ──────────────────────────────────────────────────────────────

@app.post("/api/v1/ai-agent/chat")
async def ai_agent_chat(
    body: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "founder" and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="AI CFO Agent faqat ta'sischilar uchun")
    try:
        result = generate_chat_response(db, body.message, body.history)
    except GeminiNotConfigured as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except GeminiError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    return {"success": True, "reply": result["reply"], "model": result["model"]}


# ── Admin ──────────────────────────────────────────────────────────────────────

@app.get("/api/v1/admin/users")
async def admin_users(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return {"success": True, "data": [u.to_public() for u in users]}


@app.get("/api/v1/admin/stats")
async def admin_stats(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    total_users = db.query(User).count()
    total_audits = db.query(AuditLog).count()
    feed_items = db.query(AuditLog).filter(AuditLog.published_to_feed == True).count()
    badge_holders = db.query(User).filter(User.badge_verified == True).count()
    return {
        "success": True,
        "data": {
            "total_users": total_users,
            "total_audits": total_audits,
            "feed_items": feed_items,
            "badge_holders": badge_holders,
            "gemini_configured": True,
        },
    }


@app.patch("/api/v1/admin/users/{user_id}/status")
async def toggle_user_status(
    user_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="O'z hisobingizni o'chira olmaysiz")
    user.is_active = not user.is_active
    db.commit()
    return {"success": True, "is_active": user.is_active}


@app.patch("/api/v1/admin/users/{user_id}/tax-status")
async def update_tax_status(
    user_id: int,
    tax_status: str,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    allowed = {"UNVERIFIED", "PENDING", "VERIFIED", "FLAGGED"}
    if tax_status.upper() not in allowed:
        raise HTTPException(status_code=400, detail=f"Status: {', '.join(allowed)}")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    user.tax_status = tax_status.upper()
    db.commit()
    return {"success": True, "tax_status": user.tax_status}


@app.post("/api/v1/admin/gemini-key")
async def test_ai_connection(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Mahalliy AI model bilan ulanishni tekshiradi."""
    ok, msg = validate_key("")
    if not ok:
        raise HTTPException(status_code=400, detail=msg)
    return {"success": True, "message": msg}


@app.get("/api/v1/admin/gemini-key")
async def get_ai_model_status(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Mahalliy AI model holati va ma'lumotlarini qaytaradi."""
    return {
        "success": True,
        "configured": True,
        "masked_key": AI_BASE_URL,
        "model": AI_MODEL,
        "updated_at": None,
    }
