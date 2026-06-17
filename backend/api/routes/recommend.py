"""
AI Recommendation engine routes for GAIA.
Generates prioritized zone recommendations based on impact-per-investment.
"""
from fastapi import APIRouter
from api.models.schemas import RecommendationResponse, Recommendation
from api.models.ml_model import climate_model

router = APIRouter(prefix="/api", tags=["recommendations"])


def generate_rationale(zone_name: str, rank: int, temp_reduction: float, carbon: float, budget_pct: float) -> str:
    """Generate a human-readable recommendation rationale."""
    intensity = "highest" if rank <= 3 else "significant" if rank <= 7 else "moderate"
    templates = [
        f"{zone_name} should receive {budget_pct:.0f}% of the plantation budget because it offers the {intensity} predicted cooling impact of {temp_reduction:.1f}°C reduction.",
        f"Investing in {zone_name} yields {temp_reduction:.1f}°C cooling and {carbon:.1f} tons CO₂/year sequestration — ranking it as a {intensity}-priority zone.",
        f"With current heat stress levels, {zone_name} presents {intensity} opportunity for intervention, potentially sequestering {carbon:.1f} tons of CO₂ annually.",
    ]
    return templates[rank % 3]


@router.post("/recommend", response_model=RecommendationResponse)
async def recommend(budget_lakhs: float = 500.0):
    """
    Generate prioritized recommendations across all zones.
    Runs a simulation with moderate defaults and ranks by impact.
    """
    zones = climate_model.get_zones()
    if not zones:
        return RecommendationResponse(recommendations=[], total_budget=budget_lakhs)

    # Run simulation for each zone with moderate intervention
    intervention = {
        "tree_increase_pct": 15,
        "green_space_pct": 10,
        "roof_greening_pct": 8,
        "cool_roof_pct": 12,
        "budget_lakhs": budget_lakhs / len(zones),
    }

    results = []
    for z in zones:
        result = climate_model.simulate_intervention(z, intervention)
        results.append(result)

    # Sort by cost efficiency (impact per investment)
    results.sort(key=lambda x: x["cost_efficiency"], reverse=True)

    # Distribute budget based on impact ranking
    total_efficiency = sum(r["cost_efficiency"] for r in results)
    recommendations = []

    for rank, r in enumerate(results, 1):
        budget_pct = round(
            (r["cost_efficiency"] / total_efficiency * 100) if total_efficiency > 0 else (100 / len(results)),
            1,
        )
        recommendations.append(Recommendation(
            zone_id=r["zone_id"],
            zone_name=r["zone_name"],
            priority_rank=rank,
            impact_score=round(r["cost_efficiency"], 1),
            recommended_budget_pct=budget_pct,
            rationale=generate_rationale(
                r["zone_name"], rank, r["temp_reduction"], r["carbon_sequestration"], budget_pct
            ),
            temp_reduction_potential=r["temp_reduction"],
            carbon_benefit=r["carbon_sequestration"],
        ))

    return RecommendationResponse(
        recommendations=recommendations,
        total_budget=budget_lakhs,
    )
