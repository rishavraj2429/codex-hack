"""
Heatmap data routes for GAIA.
"""
from typing import List, Optional
from fastapi import APIRouter, Query

from api.models.schemas import ZoneHeatData, MonthlyTrend
from api.models.ml_model import climate_model

router = APIRouter(prefix="/api", tags=["heatmap"])


@router.get("/heatmap", response_model=List[ZoneHeatData])
async def get_heatmap():
    """Return all zone data for map rendering."""
    zones = climate_model.get_zones()
    return zones


@router.get("/zones/{zone_id}")
async def get_zone(zone_id: str):
    """Get detailed data for a specific zone."""
    zone = climate_model.get_zone(zone_id)
    if not zone:
        return {"error": "Zone not found"}
    return zone


@router.get("/trends")
async def get_trends(zone_id: Optional[str] = Query(None)):
    """Get monthly temperature trends. Optionally filter by zone."""
    trends = climate_model.get_trends(zone_id)
    return trends
