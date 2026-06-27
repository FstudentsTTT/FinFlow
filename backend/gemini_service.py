"""
FinFlow AI — Local AI execution layer

Mahalliy LM Studio (ngrok orqali) bilan ulangan deepseek modeli orqali
moliyaviy maslahat va CFO agent suhbatlarini bajaradi.
OpenAI-compatible API formatida so'rov yuboradi.
"""

from __future__ import annotations

import json
import re

import requests
from sqlalchemy.orm import Session

from ai_prompt import AI_CFO_AGENT_PROMPT, FINANCIAL_ADVISORY_SYSTEM_PROMPT, build_user_message

AI_BASE_URL = "https://seventh-ecologist-motivate.ngrok-free.dev/v1"
AI_MODEL = "deepseek/deepseek-r1-0528-qwen3-8b"
AI_HEADERS = {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json",
}


class GeminiNotConfigured(Exception):
    pass


class GeminiError(Exception):
    pass


def get_gemini_key(db: Session) -> str | None:
    # Mahalliy model API kalitini talab qilmaydi
    return "local"


def set_gemini_key(db: Session, api_key: str) -> None:
    # Mahalliy model uchun kalit saqlanmaydi
    pass


def _strip_thinking(text: str) -> str:
    """DeepSeek-R1 modelining <think>...</think> bloklarini olib tashlaydi."""
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    return text.strip()


def _extract_json(text: str) -> str:
    """Matndan JSON qismini ajratib oladi (markdown fenslarini tozalaydi)."""
    if text.startswith("```"):
        parts = text.split("```", 2)
        if len(parts) >= 2:
            text = parts[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()

    # JSON bloklarini izlash: { ... } yoki [ ... ]
    match = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", text)
    if match:
        return match.group(1).strip()
    return text.strip()


def _chat_completions(
    messages: list[dict],
    temperature: float = 0.4,
    max_tokens: int = 4096,
) -> str:
    """OpenAI-compatible /chat/completions endpoint ga so'rov yuboradi."""
    payload = {
        "model": AI_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    try:
        resp = requests.post(
            f"{AI_BASE_URL}/chat/completions",
            headers=AI_HEADERS,
            json=payload,
            timeout=180,
        )
        resp.raise_for_status()
        data = resp.json()
        content = data["choices"][0]["message"]["content"]
        return (content or "").strip()
    except requests.Timeout:
        raise GeminiError("AI model vaqt tugadi (timeout). LM Studio ishlaётganini tekshiring.")
    except requests.ConnectionError:
        raise GeminiError("AI modelga ulanib bo'lmadi. Ngrok va LM Studio ishlaётganini tekshiring.")
    except requests.HTTPError as exc:
        raise GeminiError(f"AI model HTTP xatosi: {exc}") from exc
    except (KeyError, IndexError) as exc:
        raise GeminiError(f"AI model javob formati noto'g'ri: {exc}") from exc
    except Exception as exc:
        raise GeminiError(f"AI model xatosi: {exc}") from exc


def generate_advisory(db: Session, audit_results: dict) -> dict:
    """
    Moliyaviy maslahat generatsiyasi.
    Qaytaradi: { "advisory": {...}, "model": "...", "usage": {} }
    """
    user_message = build_user_message(audit_results)
    messages = [
        {"role": "system", "content": FINANCIAL_ADVISORY_SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]

    raw_text = _chat_completions(messages, temperature=0.4, max_tokens=4096)
    raw_text = _strip_thinking(raw_text)
    raw_text = _extract_json(raw_text)

    try:
        advisory = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        raise GeminiError(
            f"AI model JSON formatida javob bermadi. Xato: {exc}\n"
            f"Javob boshi: {raw_text[:200]}"
        ) from exc

    return {"advisory": advisory, "model": AI_MODEL, "usage": {}}


def generate_chat_response(
    db: Session,
    message: str,
    history: list[dict] | None = None,
) -> dict:
    """
    AI CFO Agent suhbat javobi.
    Qaytaradi: { "reply": "...", "model": "..." }
    """
    messages = [{"role": "system", "content": AI_CFO_AGENT_PROMPT}]

    if history:
        for turn in history[-6:]:
            role = turn.get("role", "user")
            content = turn.get("content", "")
            if role in ("user", "assistant") and content:
                messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": message})

    reply = _chat_completions(messages, temperature=0.6, max_tokens=1024)
    reply = _strip_thinking(reply)

    return {"reply": reply, "model": AI_MODEL}


DOCUMENT_EXTRACTION_PROMPT = """Sen moliyaviy hujjat tahlil qiluvchi AI tizimsan.
Berilgan hujjat matnidan moliyaviy ko'rsatkichlarni topib, FAQAT quyidagi JSON formatida qaytar.
Topilmagan qiymatlarni null qilib qoldiring. Raqamlarda vergul/bo'sh joy bo'lmasin (faqat son).

{
  "business_name": null,
  "annual_revenue": null,
  "annual_operating_expenses": null,
  "gross_monthly_payroll": null,
  "annual_debt_principal": null,
  "annual_debt_interest": null,
  "total_assets": null,
  "total_liabilities": null,
  "employee_count": null,
  "years_in_operation": null,
  "monthly_revenues": []
}

Qoidalar:
- Barcha pul miqdorlari so'mda (UZS) bo'lishi kerak
- monthly_revenues — oyma-oy daromadlar ro'yxati (topilsa)
- Faqat JSON qaytar, boshqa hech narsa yozma"""


def extract_financials_from_document(text: str) -> dict:
    """Hujjat matnidan moliyaviy ko'rsatkichlarni AI orqali ajratib oladi."""
    if not text or len(text.strip()) < 30:
        raise GeminiError("Hujjatdan matn o'qib bo'lmadi yoki hujjat bo'sh")

    messages = [
        {"role": "system", "content": DOCUMENT_EXTRACTION_PROMPT},
        {"role": "user", "content": f"Hujjat matni:\n\n{text[:10000]}"},
    ]

    raw = _chat_completions(messages, temperature=0.1, max_tokens=800)
    raw = _strip_thinking(raw)
    raw = _extract_json(raw)

    try:
        result = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise GeminiError(f"FinFlow AI hujjatdan ma'lumot ajrata olmadi: {exc}") from exc

    return result


def validate_key(api_key: str) -> tuple[bool, str]:
    """Mahalliy AI model bilan ulanishni tekshiradi."""
    try:
        resp = requests.post(
            f"{AI_BASE_URL}/chat/completions",
            headers=AI_HEADERS,
            json={
                "model": AI_MODEL,
                "messages": [{"role": "user", "content": "Reply with: OK"}],
                "max_tokens": 20,
                "temperature": 0,
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        text = data["choices"][0]["message"]["content"].strip()
        text = _strip_thinking(text)
        return True, f"AI model muvaffaqiyatli ulandi (javob: {text[:40]})"
    except requests.Timeout:
        return False, "Ulanish vaqti tugadi. LM Studio ishlaётganini tekshiring."
    except requests.ConnectionError:
        return False, "Ngrok tunneli yoki LM Studio ishlamayapti."
    except Exception as exc:
        return False, f"Ulanish xatosi: {exc}"
