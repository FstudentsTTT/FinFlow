"""
FinFlow AI — API request/response schemas (Pydantic v2)
Strict input validation guards against injection & malformed payloads.
"""

from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=120)
    password: str = Field(..., min_length=8, max_length=128)
    role: str = Field("founder", pattern="^(founder|investor)$")
    business_name: str | None = Field(None, max_length=200)
    region: str | None = Field(None, max_length=60)

    @field_validator("full_name", "business_name")
    @classmethod
    def _strip(cls, v):
        return v.strip() if isinstance(v, str) else v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict



# ── Feed publishing ───────────────────────────────────────────────────────────

class PublishFeedRequest(BaseModel):
    audit_log_id: int
    pitch_title: str = Field(..., min_length=3, max_length=160)


# ── AI CFO Agent ──────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: list[dict] | None = Field(default=None)
