"""
Reports routes for GAIA.
Generates report data for client-side PDF rendering.
"""
from datetime import datetime
from fastapi import APIRouter
from api.models.ml_model import climate_model

router = APIRouter(prefix="/api", tags=["reports"])


@router.get("/reports")
async def generate_report():
    """Generate comprehensive report data."""
    zones = climate_model.get_zones()
    if not zones:
        return {"error": "No zone data available"}

    temps = [z["surface_temperature"] for z in zones]
    greens = [z["green_cover_pct"] for z in zones]
    risks = [z["heat_risk_score"] for z in zones]

    # Run a moderate simulation for all zones
    intervention = {
        "tree_increase_pct": 15,
        "green_space_pct": 10,
        "roof_greening_pct": 8,
        "cool_roof_pct": 12,
        "budget_lakhs": 25,
    }
    sim_results = []
    for z in zones:
        result = climate_model.simulate_intervention(z, intervention)
        sim_results.append(result)

    high_risk_zones = [z for z in zones if z["heat_risk_score"] > 65]
    top_priority = sorted(sim_results, key=lambda x: x["cost_efficiency"], reverse=True)[:5]

    return {
        "generated_at": datetime.utcnow().isoformat(),
        "title": "GAIA Urban Climate Assessment Report",
        "executive_summary": {
            "total_zones": len(zones),
            "avg_temperature": round(sum(temps) / len(temps), 1),
            "max_temperature": round(max(temps), 1),
            "min_temperature": round(min(temps), 1),
            "avg_green_cover": round(sum(greens) / len(greens), 1),
            "high_risk_zones": len(high_risk_zones),
            "avg_heat_risk": round(sum(risks) / len(risks), 1),
        },
        "current_conditions": {
            "zones": zones,
            "temperature_range": f"{round(min(temps), 1)}°C – {round(max(temps), 1)}°C",
            "green_cover_range": f"{round(min(greens), 1)}% – {round(max(greens), 1)}%",
        },
        "simulation_results": {
            "intervention_applied": intervention,
            "results": sim_results,
            "avg_temp_reduction": round(
                sum(r["temp_reduction"] for r in sim_results) / len(sim_results), 2
            ),
            "total_carbon_sequestration": round(
                sum(r["carbon_sequestration"] for r in sim_results), 1
            ),
        },
        "recommendations": {
            "top_priority_zones": [
                {
                    "zone_id": z["zone_id"],
                    "zone_name": z["zone_name"],
                    "temp_reduction": z["temp_reduction"],
                    "carbon_sequestration": z["carbon_sequestration"],
                    "cost_efficiency": z["cost_efficiency"],
                }
                for z in top_priority
            ],
        },
        "sdg_impact": {
            "sdg_11": "Directly supports Target 11.6 (reduce environmental impact) and 11.b (climate adaptation policies).",
            "sdg_13": "Supports Target 13.1 (strengthen resilience) and 13.2 (integrate climate measures into planning).",
        },
    }
