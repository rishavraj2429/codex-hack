"""
Pydantic schemas for GAIA API.
"""
from typing import List, Optional
from pydantic import BaseModel


# --- Auth ---
class UserRegister(BaseModel):
    email: str
    password: str
    name: str
    role: str = "planner"  # planner, government_officer, administrator


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# --- Simulation ---
class SimulationRequest(BaseModel):
    zone_id: Optional[str] = None  # None = run for all zones
    tree_increase_pct: float = 0.0
    green_space_pct: float = 0.0
    roof_greening_pct: float = 0.0
    cool_roof_pct: float = 0.0
    budget_lakhs: float = 100.0


class ZoneResult(BaseModel):
    zone_id: str
    zone_name: str
    current_temp: float
    predicted_temp: float
    temp_reduction: float
    carbon_sequestration: float
    sustainability_score: float
    cost_efficiency: float


class SimulationResponse(BaseModel):
    zones: List[ZoneResult]
    total_temp_reduction_avg: float
    total_carbon_sequestration: float
    overall_sustainability_score: float
    budget_used: float


# --- Recommendation ---
class Recommendation(BaseModel):
    zone_id: str
    zone_name: str
    priority_rank: int
    impact_score: float
    recommended_budget_pct: float
    rationale: str
    temp_reduction_potential: float
    carbon_benefit: float


class RecommendationResponse(BaseModel):
    recommendations: List[Recommendation]
    total_budget: float


# --- Chat ---
class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    reply: str


# --- HeatMap ---
class ZoneHeatData(BaseModel):
    zone_id: str
    zone_name: str
    latitude: float
    longitude: float
    surface_temperature: float
    green_cover_pct: float
    building_density: float
    population_density: int
    heat_risk_score: float
    albedo: float
    tree_count: int
    area_sqkm: float


# --- KPIs ---
class KPIResponse(BaseModel):
    heat_vulnerability_index: float
    avg_green_cover_pct: float
    carbon_reduction_potential: float
    predicted_temp_reduction: float
    total_zones: int
    high_risk_zones: int
    total_tree_count: int
    avg_temperature: float


# --- Monthly Trends ---
class MonthlyTrend(BaseModel):
    month: str
    month_idx: int
    temperature: float
