"""
Simulation routes for GAIA.
Runs the ML prediction pipeline with user-defined interventions.
"""
from fastapi import APIRouter, HTTPException
from api.models.schemas import SimulationRequest, SimulationResponse, ZoneResult
from api.models.ml_model import climate_model

router = APIRouter(prefix="/api", tags=["simulation"])


@router.post("/simulate", response_model=SimulationResponse)
async def simulate(req: SimulationRequest):
    """
    Run a climate intervention simulation.
    If zone_id is specified, simulate for that zone only.
    Otherwise, simulate across all zones.
    """
    zones = climate_model.get_zones()
    if not zones:
        raise HTTPException(status_code=500, detail="Zone data not loaded")

    intervention = {
        "tree_increase_pct": req.tree_increase_pct,
        "green_space_pct": req.green_space_pct,
        "roof_greening_pct": req.roof_greening_pct,
        "cool_roof_pct": req.cool_roof_pct,
        "budget_lakhs": req.budget_lakhs,
    }

    if req.zone_id:
        zone = climate_model.get_zone(req.zone_id)
        if not zone:
            raise HTTPException(status_code=404, detail=f"Zone {req.zone_id} not found")
        target_zones = [zone]
    else:
        target_zones = zones

    results = []
    for z in target_zones:
        result = climate_model.simulate_intervention(z, intervention)
        results.append(ZoneResult(
            zone_id=result["zone_id"],
            zone_name=result["zone_name"],
            current_temp=result["current_temp"],
            predicted_temp=result["predicted_temp"],
            temp_reduction=result["temp_reduction"],
            carbon_sequestration=result["carbon_sequestration"],
            sustainability_score=result["sustainability_score"],
            cost_efficiency=result["cost_efficiency"],
        ))

    # Aggregate
    total_reduction = round(
        sum(r.temp_reduction for r in results) / len(results), 2
    ) if results else 0

    total_carbon = round(sum(r.carbon_sequestration for r in results), 2)

    avg_sustainability = round(
        sum(r.sustainability_score for r in results) / len(results), 1
    ) if results else 0

    return SimulationResponse(
        zones=results,
        total_temp_reduction_avg=total_reduction,
        total_carbon_sequestration=total_carbon,
        overall_sustainability_score=avg_sustainability,
        budget_used=req.budget_lakhs,
    )
