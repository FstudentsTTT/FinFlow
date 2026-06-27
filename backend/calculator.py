"""
FinFlow AI — Deterministic Financial Calculation Engine
Implements exact Uzbekistan tax code math for SME audit and capital routing.
"""

from models import BusinessProfile, UzbekRegion, BusinessSector

# ── Tax thresholds (UZS, 2024–2025) ─────────────────────────────────────────
TAX_WALL_UZS = 1_000_000_000          # 1 billion UZS aylanma solig'i → foyda solig'i
TAX_WALL_ALERT_RATIO = 0.70            # early warning at 70 %
TAX_WALL_CRITICAL_RATIO = 0.90         # critical band at 90 %

# ── IT Park tax rates ─────────────────────────────────────────────────────────
STANDARD_SOCIAL_TAX_RATE = 0.12        # 12 % of payroll fund (standard)
IT_PARK_SOCIAL_TAX_RATE  = 0.01        # 1  % of payroll fund (IT Park resident)
STANDARD_CIT_RATE        = 0.15        # 15 % corporate income tax (standard)
IT_PARK_CIT_RATE         = 0.00        # 0  % corporate income tax (IT Park resident)

# ── SQB (State Development Bank) underwriting benchmarks ────────────────────
SQB_DSCR_MINIMUM   = 1.25
SQB_DSCR_PREFERRED = 1.50

# ── Regional subsidy matrix ───────────────────────────────────────────────────
# Keyed by UzbekRegion; each entry is a list of subsidy programme identifiers.
REGIONAL_SUBSIDIES: dict[UzbekRegion, list[str]] = {
    UzbekRegion.TASHKENT_CITY:    [],
    UzbekRegion.TASHKENT_REGION:  ["youth_entrepreneur_fund"],
    UzbekRegion.SAMARKAND:        ["tourism_development_grant", "cultural_heritage_subsidy"],
    UzbekRegion.BUKHARA:          ["tourism_development_grant", "fez_bukhara"],
    UzbekRegion.FERGANA:          ["industrial_zone_incentive", "sez_fergana"],
    UzbekRegion.NAMANGAN:         ["industrial_zone_incentive", "youth_entrepreneur_fund"],
    UzbekRegion.ANDIJAN:          ["automotive_cluster_subsidy", "sez_andijan"],
    UzbekRegion.SIRDARYO:         ["manufacturing_incentive", "agro_industrial_subsidy"],
    UzbekRegion.NAVOI:            ["fez_navoi_full", "mining_sector_benefit", "manufacturing_incentive"],
    UzbekRegion.JIZZAKH:          ["fez_jizzakh_full", "manufacturing_incentive", "agro_industrial_subsidy"],
    UzbekRegion.KASHKADARYA:      ["energy_sector_subsidy", "agro_processing_grant"],
    UzbekRegion.SURKHANDARYA:     ["border_trade_incentive", "agro_processing_grant"],
    UzbekRegion.KHOREZM:          ["cultural_heritage_subsidy", "agro_processing_grant"],
    UzbekRegion.KARAKALPAKSTAN:   ["sez_karakalpakstan", "manufacturing_incentive", "youth_entrepreneur_fund"],
}

# Subsidy programmes that are sector-restricted (programme_id → allowed sectors)
SECTOR_RESTRICTED_SUBSIDIES: dict[str, set[BusinessSector]] = {
    "agro_industrial_subsidy":  {BusinessSector.AGRICULTURE, BusinessSector.MANUFACTURING},
    "agro_processing_grant":    {BusinessSector.AGRICULTURE, BusinessSector.FOOD_BEVERAGE},
    "automotive_cluster_subsidy": {BusinessSector.MANUFACTURING},
    "mining_sector_benefit":    {BusinessSector.MANUFACTURING},
    "energy_sector_subsidy":    {BusinessSector.MANUFACTURING, BusinessSector.SERVICES},
    "border_trade_incentive":   {BusinessSector.RETAIL, BusinessSector.MANUFACTURING},
    "tourism_development_grant":{BusinessSector.SERVICES, BusinessSector.FOOD_BEVERAGE},
    "cultural_heritage_subsidy":{BusinessSector.SERVICES, BusinessSector.EDUCATION},
}

# IT Park eligibility: minimum IT-revenue share required
IT_PARK_MIN_IT_REVENUE_PCT = 50.0


# ── DSCR ─────────────────────────────────────────────────────────────────────

def calculate_dscr(profile: BusinessProfile) -> dict:
    """Debt Service Coverage Ratio — SQB primary underwriting metric."""
    noi = profile.annual_revenue - profile.annual_operating_expenses
    tds = profile.annual_debt_principal + profile.annual_debt_interest

    if tds == 0:
        # Debt-free: no leverage risk; rated as if DSCR is excellent
        return {
            "net_operating_income":  noi,
            "total_debt_service":    0,
            "dscr":                  None,
            "dscr_display":          "∞ (Debt-Free)",
            "sqb_eligible":          True,
            "sqb_rating":            "EXCELLENT",
            "sqb_minimum_threshold": SQB_DSCR_MINIMUM,
            "gap_to_minimum":        None,
        }

    dscr = noi / tds
    gap  = dscr - SQB_DSCR_MINIMUM

    if dscr >= 2.0:
        rating = "EXCELLENT"
    elif dscr >= SQB_DSCR_PREFERRED:
        rating = "STRONG"
    elif dscr >= SQB_DSCR_MINIMUM:
        rating = "ACCEPTABLE"
    elif dscr >= 1.0:
        rating = "MARGINAL"
    else:
        rating = "INELIGIBLE"

    return {
        "net_operating_income":  noi,
        "total_debt_service":    tds,
        "dscr":                  round(dscr, 4),
        "dscr_display":          f"{dscr:.2f}x",
        "sqb_eligible":          dscr >= SQB_DSCR_MINIMUM,
        "sqb_rating":            rating,
        "sqb_minimum_threshold": SQB_DSCR_MINIMUM,
        "gap_to_minimum":        round(gap, 4),
    }


# ── IT Park savings ───────────────────────────────────────────────────────────

def calculate_it_park_savings(profile: BusinessProfile) -> dict:
    """
    Exact formula from business spec:
        Annual Social Tax Savings = Gross Monthly Payroll × (0.12 − 0.01) × 12

    Also calculates foregone corporate income tax under IT Park 0 % rate.
    """
    annual_social_tax_savings = (
        profile.gross_monthly_payroll
        * (STANDARD_SOCIAL_TAX_RATE - IT_PARK_SOCIAL_TAX_RATE)
        * 12
    )

    noi = profile.annual_revenue - profile.annual_operating_expenses
    income_tax_savings = max(0, noi) * STANDARD_CIT_RATE  # savings = what they'd otherwise pay

    total_annual_savings = annual_social_tax_savings + income_tax_savings

    it_pct = profile.it_revenue_percentage or 0.0
    is_eligible = (
        profile.has_it_component
        and profile.is_registered_llc
        and it_pct >= IT_PARK_MIN_IT_REVENUE_PCT
    )

    return {
        "annual_social_tax_savings":    round(annual_social_tax_savings, 2),
        "income_tax_savings":           round(income_tax_savings, 2),
        "total_annual_savings":         round(total_annual_savings, 2),
        "monthly_equivalent_savings":   round(total_annual_savings / 12, 2),
        "is_eligible":                  is_eligible,
        "has_it_component":             profile.has_it_component,
        "it_revenue_percentage":        it_pct,
        "min_it_revenue_pct_required":  IT_PARK_MIN_IT_REVENUE_PCT,
        "standard_social_tax_rate":     STANDARD_SOCIAL_TAX_RATE,
        "it_park_social_tax_rate":      IT_PARK_SOCIAL_TAX_RATE,
        "standard_cit_rate":            STANDARD_CIT_RATE,
        "it_park_cit_rate":             IT_PARK_CIT_RATE,
    }


# ── 1 Billion UZS tax wall ───────────────────────────────────────────────────

def calculate_tax_wall_proximity(profile: BusinessProfile) -> dict:
    """
    Determines proximity to the 1 Billion UZS aylanma solig'i threshold.
    Returns a boolean alert flag and an advisory runway in months.
    """
    ratio      = profile.annual_revenue / TAX_WALL_UZS
    pct        = ratio * 100
    runway_uzs = max(0.0, TAX_WALL_UZS - profile.annual_revenue)

    # Estimate months to wall from recent revenue trend
    months_to_wall: float | None = None
    if len(profile.monthly_revenue_trend) >= 2 and runway_uzs > 0:
        recent = profile.monthly_revenue_trend[-3:]
        avg_monthly = sum(recent) / len(recent)
        if avg_monthly > 0:
            months_to_wall = round(runway_uzs / avg_monthly, 1)

    already_crossed = ratio >= 1.0
    critical_alert  = ratio >= TAX_WALL_CRITICAL_RATIO
    alert_triggered = ratio >= TAX_WALL_ALERT_RATIO  # ← the required boolean flag

    if already_crossed:
        status  = "WALL_CROSSED"
        urgency = "CRITICAL"
    elif critical_alert:
        status  = "CRITICAL_APPROACH"
        urgency = "HIGH"
    elif alert_triggered:
        status  = "APPROACHING"
        urgency = "MEDIUM"
    else:
        status  = "SAFE"
        urgency = "LOW"

    return {
        "annual_revenue":         profile.annual_revenue,
        "tax_wall_threshold_uzs": TAX_WALL_UZS,
        "proximity_percentage":   round(pct, 2),
        "remaining_runway_uzs":   runway_uzs,
        "months_to_wall":         months_to_wall,
        "alert_triggered":        alert_triggered,       # primary boolean flag
        "critical_alert":         critical_alert,
        "already_crossed":        already_crossed,
        "status":                 status,
        "urgency":                urgency,
        "alert_threshold_pct":    TAX_WALL_ALERT_RATIO * 100,
        "critical_threshold_pct": TAX_WALL_CRITICAL_RATIO * 100,
    }


# ── SQB Debt-Readiness Index (composite 0–100) ───────────────────────────────

def calculate_sqb_debt_readiness_index(
    profile: BusinessProfile,
    dscr_result: dict,
) -> dict:
    """
    Composite score modelling SQB's SME underwriting framework:
        DSCR health         40 pts
        Revenue trajectory  20 pts
        Tax wall management 20 pts
        Collateral quality  20 pts
    """
    components: dict[str, int] = {}

    # 1 — DSCR (40 pts)
    dscr = dscr_result.get("dscr")
    if dscr is None:                     # debt-free
        dscr_score = 40
    elif dscr >= 2.0:  dscr_score = 40
    elif dscr >= 1.5:  dscr_score = 35
    elif dscr >= 1.25: dscr_score = 25
    elif dscr >= 1.0:  dscr_score = 12
    else:              dscr_score = 0
    components["dscr_score"] = dscr_score

    # 2 — Revenue trajectory (20 pts)
    trend = profile.monthly_revenue_trend
    if len(trend) >= 2:
        mid = len(trend) // 2
        first_avg  = sum(trend[:mid]) / mid
        second_avg = sum(trend[mid:]) / (len(trend) - mid)
        growth = (second_avg - first_avg) / first_avg if first_avg > 0 else 0
        if   growth >= 0.20: rev_score = 20
        elif growth >= 0.10: rev_score = 16
        elif growth >= 0.05: rev_score = 12
        elif growth >= 0.00: rev_score = 8
        else:                rev_score = 4
    else:
        rev_score = 8  # insufficient data — neutral
    components["revenue_trend_score"] = rev_score

    # 3 — Tax wall management (20 pts)
    wall_ratio = profile.annual_revenue / TAX_WALL_UZS
    if   wall_ratio < 0.50: tax_score = 20
    elif wall_ratio < 0.70: tax_score = 16
    elif wall_ratio < 0.90: tax_score = 10
    elif wall_ratio < 1.00: tax_score = 5
    else:                   tax_score = 0   # already over the wall, unmanaged
    components["tax_compliance_score"] = tax_score

    # 4 — Collateral quality (20 pts)
    if profile.total_assets > 0:
        alf = profile.total_assets / max(profile.total_liabilities, 1)
        if   alf >= 3.0: col_score = 20
        elif alf >= 2.0: col_score = 16
        elif alf >= 1.5: col_score = 12
        elif alf >= 1.0: col_score = 8
        else:            col_score = 4
    else:
        col_score = 8   # no asset data — neutral
    components["collateral_score"] = col_score

    total = sum(components.values())

    if   total >= 85: rating = "PREMIUM";    badge_eligible = True
    elif total >= 70: rating = "STRONG";     badge_eligible = True
    elif total >= 55: rating = "QUALIFIED";  badge_eligible = False
    elif total >= 40: rating = "DEVELOPING"; badge_eligible = False
    else:             rating = "INELIGIBLE"; badge_eligible = False

    return {
        "total_score":        total,
        "max_score":          100,
        "rating":             rating,
        "badge_eligible":     badge_eligible,    # gates AI Verified Badge & investor feed
        "investor_visible":   badge_eligible,
        "components":         components,
    }


# ── Regional subsidies ───────────────────────────────────────────────────────

def get_regional_subsidies(profile: BusinessProfile) -> dict:
    """Cross-reference region + sector against active subsidy database."""
    all_programmes = REGIONAL_SUBSIDIES.get(profile.region, [])
    matched: list[str] = []

    for prog in all_programmes:
        restricted_to = SECTOR_RESTRICTED_SUBSIDIES.get(prog)
        if restricted_to is None or profile.sector in restricted_to:
            matched.append(prog)

    has_fez = any("fez" in p or "sez" in p for p in matched)

    return {
        "region":               profile.region.value,
        "tuman":                profile.tuman,
        "matched_programmes":   matched,
        "total_matched":        len(matched),
        "has_fez_sez_access":   has_fez,
    }


# ── Master audit runner ───────────────────────────────────────────────────────

def run_full_audit(profile: BusinessProfile) -> dict:
    """Execute the complete deterministic audit pipeline."""
    dscr    = calculate_dscr(profile)
    it_park = calculate_it_park_savings(profile)
    tax_wall= calculate_tax_wall_proximity(profile)
    sqb_idx = calculate_sqb_debt_readiness_index(profile, dscr)
    subsidy = get_regional_subsidies(profile)

    return {
        "business_profile": {
            "name":               profile.business_name,
            "sector":             profile.sector.value,
            "region":             profile.region.value,
            "tuman":              profile.tuman,
            "employee_count":     profile.employee_count,
            "years_in_operation": profile.years_in_operation,
        },
        "dscr_analysis":          dscr,
        "it_park_optimization":   it_park,
        "tax_wall_analysis":      tax_wall,
        "sqb_debt_readiness_index": sqb_idx,
        "regional_subsidies":     subsidy,
        "ai_badge_eligible":      sqb_idx["badge_eligible"],
        "audit_timestamp":        None,   # set by caller
    }
