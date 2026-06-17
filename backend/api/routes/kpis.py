"""
KPI aggregation routes for GAIA.
"""
from fastapi import APIRouter
from api.models.schemas import KPIResponse
from api.models.ml_model import climate_model

router = APIRouter(prefix="/api", tags=["kpis"])


@router.get("/kpis", response_model=KPIResponse)
async def get_kpis():
    """Return aggregated KPIs across all zones."""
    zones = climate_model.get_zones()
    if not zones:
        return KPIResponse(
            heat_vulnerability_index=0,
            avg_green_cover_pct=0,
            carbon_reduction_potential=0,
            predicted_temp_reduction=0,
            total_zones=0,
            high_risk_zones=0,
            total_tree_count=0,
            avg_temperature=0,
        )

    temps = [z["surface_temperature"] for z in zones]
    green_covers = [z["green_cover_pct"] for z in zones]
    heat_risks = [z["heat_risk_score"] for z in zones]
    tree_counts = [z["tree_count"] for z in zones]

    avg_temp = round(sum(temps) / len(temps), 1)
    avg_green = round(sum(green_covers) / len(green_covers), 1)
    avg_risk = round(sum(heat_risks) / len(heat_risks), 1)
    high_risk = sum(1 for r in heat_risks if r > 65)

    # Carbon reduction potential: estimated from green cover gap
    max_green = 45  # target green cover %
    carbon_potential = round(
        sum((max_green - g) * 0.8 for g in green_covers if g < max_green), 1
    )

    # Predicted temp reduction if all zones reach 30% green cover
    predicted_reduction = round(
        sum(max(0, (30 - g) * 0.18) for g in green_covers) / len(zones), 1
    )

    return KPIResponse(
        heat_vulnerability_index=avg_risk,
        avg_green_cover_pct=avg_green,
        carbon_reduction_potential=carbon_potential,
        predicted_temp_reduction=predicted_reduction,
        total_zones=len(zones),
        high_risk_zones=high_risk,
        total_tree_count=sum(tree_counts),
        avg_temperature=avg_temp,
    )
