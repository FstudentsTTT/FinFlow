from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class BusinessSector(str, Enum):
    TECHNOLOGY = "technology"
    RETAIL = "retail"
    MANUFACTURING = "manufacturing"
    AGRICULTURE = "agriculture"
    SERVICES = "services"
    FOOD_BEVERAGE = "food_beverage"
    CONSTRUCTION = "construction"
    EDUCATION = "education"
    HEALTHCARE = "healthcare"


class UzbekRegion(str, Enum):
    TASHKENT_CITY = "tashkent_city"
    TASHKENT_REGION = "tashkent_region"
    SAMARKAND = "samarkand"
    BUKHARA = "bukhara"
    FERGANA = "fergana"
    NAMANGAN = "namangan"
    ANDIJAN = "andijan"
    SIRDARYO = "sirdaryo"
    NAVOI = "navoi"
    JIZZAKH = "jizzakh"
    KASHKADARYA = "kashkadarya"
    SURKHANDARYA = "surkhandarya"
    KHOREZM = "khorezm"
    KARAKALPAKSTAN = "karakalpakstan"


class BusinessProfile(BaseModel):
    business_name: str = Field(..., description="Legal business name")
    sector: BusinessSector
    region: UzbekRegion
    tuman: Optional[str] = Field(None, description="District (tuman) within the region")

    # Revenue (UZS)
    annual_revenue: float = Field(..., gt=0, description="Annual revenue in UZS")
    monthly_revenue_trend: list[float] = Field(
        ..., min_length=3, max_length=12,
        description="Last 3-12 months of monthly revenue figures in UZS"
    )

    # Expenses (UZS)
    annual_operating_expenses: float = Field(
        ..., ge=0, description="Annual operating expenses excluding debt service"
    )
    gross_monthly_payroll: float = Field(
        ..., ge=0, description="Total gross monthly payroll in UZS"
    )

    # Debt (UZS)
    annual_debt_principal: float = Field(0, ge=0, description="Annual principal repayments in UZS")
    annual_debt_interest: float = Field(0, ge=0, description="Annual interest payments in UZS")

    # Balance sheet (UZS)
    total_assets: float = Field(0, ge=0, description="Total business assets in UZS")
    total_liabilities: float = Field(0, ge=0, description="Total business liabilities in UZS")

    # Business metadata
    employee_count: int = Field(..., ge=1)
    years_in_operation: int = Field(..., ge=0)
    is_registered_llc: bool = Field(True, description="Registered as MChJ (LLC) in Uzbekistan")
    has_it_component: bool = Field(False, description="Has software/digital services component")
    it_revenue_percentage: Optional[float] = Field(
        None, ge=0, le=100,
        description="Percentage of revenue from IT/digital services (0-100)"
    )


class AuditResponse(BaseModel):
    success: bool
    data: dict


class AdvisoryResponse(BaseModel):
    success: bool
    data: dict
