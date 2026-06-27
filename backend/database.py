"""
FinFlow AI — Persistence Layer (SQLAlchemy 2.0 + SQLite)

Defines the ORM models required by the MVP:
  • User      — authentication, role flag, business + tax status
  • Setting   — key/value store (holds the encrypted Gemini API key)
  • AuditLog  — every AI audit run, persisted for the admin panel & history
"""

from __future__ import annotations

import os
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
    sessionmaker,
)

# ── Engine ────────────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "finflow.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # FastAPI runs handlers in threads
    echo=False,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


# ── Models ────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    # Roles: founders run audits; investors browse the angel feed; admins manage.
    role: Mapped[str] = mapped_column(String(20), default="founder", nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Business / tax status (surfaced in the admin panel)
    business_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    region: Mapped[str | None] = mapped_column(String(60), nullable=True)
    tax_status: Mapped[str] = mapped_column(String(40), default="UNVERIFIED", nullable=False)
    last_sqb_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    badge_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    audit_logs: Mapped[list["AuditLog"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    def to_public(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
            "is_admin": self.is_admin,
            "is_active": self.is_active,
            "business_name": self.business_name,
            "region": self.region,
            "tax_status": self.tax_status,
            "last_sqb_score": self.last_sqb_score,
            "badge_verified": self.badge_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Setting(Base):
    """Simple key/value config store. Holds the admin-supplied Gemini API key."""
    __tablename__ = "settings"

    key: Mapped[str] = mapped_column(String(80), primary_key=True)
    value: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )


class AuditLog(Base):
    """One row per AI audit run — powers history, the angel feed and admin stats."""
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)

    business_name: Mapped[str] = mapped_column(String(255), nullable=False)
    sector: Mapped[str | None] = mapped_column(String(60), nullable=True)
    region: Mapped[str | None] = mapped_column(String(60), nullable=True)

    sqb_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sqb_rating: Mapped[str | None] = mapped_column(String(40), nullable=True)
    dscr_display: Mapped[str | None] = mapped_column(String(40), nullable=True)
    badge_eligible: Mapped[bool] = mapped_column(Boolean, default=False)

    annual_revenue: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_tax_savings: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Full JSON payloads (deterministic audit + AI advisory) for replay / the feed
    audit_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    advisory_json: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Angel Discovery Feed
    video_filename: Mapped[str | None] = mapped_column(String(255), nullable=True)
    pitch_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    published_to_feed: Mapped[bool] = mapped_column(Boolean, default=False)

    ai_model: Mapped[str | None] = mapped_column(String(60), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    user: Mapped["User"] = relationship(back_populates="audit_logs")

    def to_dict(self, include_payloads: bool = False) -> dict:
        out = {
            "id": self.id,
            "user_id": self.user_id,
            "business_name": self.business_name,
            "sector": self.sector,
            "region": self.region,
            "sqb_score": self.sqb_score,
            "sqb_rating": self.sqb_rating,
            "dscr_display": self.dscr_display,
            "badge_eligible": self.badge_eligible,
            "annual_revenue": self.annual_revenue,
            "total_tax_savings": self.total_tax_savings,
            "video_filename": self.video_filename,
            "pitch_title": self.pitch_title,
            "published_to_feed": self.published_to_feed,
            "ai_model": self.ai_model,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_payloads:
            import json
            out["audit"] = json.loads(self.audit_json) if self.audit_json else None
            out["advisory"] = json.loads(self.advisory_json) if self.advisory_json else None
        return out


# ── Session dependency ────────────────────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
