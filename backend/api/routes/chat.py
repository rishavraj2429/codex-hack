"""
AI Climate Assistant chat routes for GAIA.
Rule-based responses with zone awareness for hackathon demo.
"""
import random
from fastapi import APIRouter
from api.models.schemas import ChatRequest, ChatResponse
from api.models.ml_model import climate_model

router = APIRouter(prefix="/api", tags=["chat"])


def build_zone_context():
    """Build a summary of zone data for contextual responses."""
    zones = climate_model.get_zones()
    if not zones:
        return {}

    hottest = max(zones, key=lambda z: z["surface_temperature"])
    coolest = min(zones, key=lambda z: z["surface_temperature"])
    greenest = max(zones, key=lambda z: z["green_cover_pct"])
    least_green = min(zones, key=lambda z: z["green_cover_pct"])
    highest_risk = max(zones, key=lambda z: z["heat_risk_score"])

    return {
        "total_zones": len(zones),
        "avg_temp": round(sum(z["surface_temperature"] for z in zones) / len(zones), 1),
        "hottest": hottest,
        "coolest": coolest,
        "greenest": greenest,
        "least_green": least_green,
        "highest_risk": highest_risk,
        "zones": {z["zone_id"]: z for z in zones},
    }


def get_zone_answer(zone_id: str, ctx: dict) -> str:
    """Answer questions about a specific zone."""
    zone = ctx["zones"].get(zone_id)
    if not zone:
        return f"I don't have data for zone {zone_id}. Available zones are Z01 through Z20."

    risk_level = "critically high" if zone["heat_risk_score"] > 70 else "elevated" if zone["heat_risk_score"] > 50 else "moderate"

    return (
        f"**{zone['zone_name']} ({zone['zone_id']})**\n\n"
        f"• Surface Temperature: **{zone['surface_temperature']}°C**\n"
        f"• Green Cover: **{zone['green_cover_pct']}%**\n"
        f"• Building Density: **{zone['building_density']}**\n"
        f"• Population Density: **{zone['population_density']:,}/km²**\n"
        f"• Heat Risk Score: **{zone['heat_risk_score']}** ({risk_level})\n\n"
        f"**Recommendation**: "
        + (
            f"This zone has {risk_level} heat risk. I'd recommend prioritizing tree plantation and cool roof adoption. "
            f"Increasing green cover by 15% could reduce surface temperature by approximately {round(15 * 0.18, 1)}°C."
            if zone["heat_risk_score"] > 50
            else f"This zone has {risk_level} heat risk. Maintain current green cover and consider expanding it by 10% for preventive benefit."
        )
    )


def process_message(user_msg: str, ctx: dict) -> str:
    """Process user message and generate contextual response."""
    msg_lower = user_msg.lower()

    # Zone-specific queries
    for zone_id in ctx.get("zones", {}):
        if zone_id.lower() in msg_lower or ctx["zones"][zone_id]["zone_name"].lower() in msg_lower:
            return get_zone_answer(zone_id, ctx)

    # Hottest / highest temperature queries
    if any(w in msg_lower for w in ["hottest", "highest temperature", "most heat", "warmest"]):
        h = ctx["hottest"]
        return (
            f"The hottest zone is **{h['zone_name']} ({h['zone_id']})** with a surface temperature of "
            f"**{h['surface_temperature']}°C** and a heat risk score of **{h['heat_risk_score']}**.\n\n"
            f"Key factors: building density of {h['building_density']}, green cover at only {h['green_cover_pct']}%, "
            f"and population density of {h['population_density']:,}/km².\n\n"
            f"**Priority intervention**: Increase green cover by 20% and adopt cool roofs to achieve estimated 3-4°C cooling."
        )

    # Green cover queries
    if any(w in msg_lower for w in ["green", "tree", "vegetation", "plantation"]):
        g = ctx["greenest"]
        lg = ctx["least_green"]
        return (
            f"**Green Cover Analysis:**\n\n"
            f"• Greenest zone: **{g['zone_name']}** ({g['green_cover_pct']}% cover)\n"
            f"• Least green: **{lg['zone_name']}** ({lg['green_cover_pct']}% cover)\n\n"
            f"The city average is approximately {sum(z['green_cover_pct'] for z in ctx['zones'].values()) / len(ctx['zones']):.1f}% green cover.\n\n"
            f"**Recommendation**: Focus plantation drives on {lg['zone_name']} and zones with less than 15% green cover. "
            f"Each 10% increase in green cover reduces surface temperature by approximately 1.8°C."
        )

    # Best intervention queries
    if any(w in msg_lower for w in ["best intervention", "recommend", "what should", "priority", "which zone"]):
        hr = ctx["highest_risk"]
        return (
            f"Based on the current data, I recommend prioritizing **{hr['zone_name']} ({hr['zone_id']})**.\n\n"
            f"**Rationale:**\n"
            f"• Highest heat risk score: **{hr['heat_risk_score']}**\n"
            f"• Current temperature: **{hr['surface_temperature']}°C**\n"
            f"• Low green cover: **{hr['green_cover_pct']}%**\n\n"
            f"**Suggested Intervention Package:**\n"
            f"1. Tree plantation: +20% green cover (est. -3.6°C)\n"
            f"2. Cool roof adoption: 30% of buildings (est. -1.5°C)\n"
            f"3. Green space expansion: 15% (est. -1.6°C)\n\n"
            f"**Estimated total cooling: ~4.5-5.5°C**\n"
            f"**Carbon benefit: ~80-120 tons CO₂/year**\n\n"
            f"Use the Simulation Lab to run precise predictions with your specific budget."
        )

    # UHI explanation
    if any(w in msg_lower for w in ["urban heat island", "uhi", "what is heat", "explain heat"]):
        return (
            "**Urban Heat Island (UHI) Effect**\n\n"
            "Urban Heat Islands occur when cities replace natural land cover with dense concentrations of pavement, "
            "buildings, and infrastructure that absorb and re-emit the sun's heat.\n\n"
            "**Key drivers:**\n"
            "• Dark surfaces (roads, rooftops) absorb solar radiation\n"
            "• Reduced vegetation means less evapotranspiration cooling\n"
            "• Human activities generate waste heat\n"
            "• Urban canyon geometry traps heat\n\n"
            "**Impact:**\n"
            "Cities can be 3-8°C warmer than surrounding rural areas, increasing energy costs, "
            "heat-related illness, and air pollution.\n\n"
            f"In your city, the temperature ranges from {ctx['coolest']['surface_temperature']}°C "
            f"to {ctx['hottest']['surface_temperature']}°C across {ctx['total_zones']} zones."
        )

    # SDG alignment
    if any(w in msg_lower for w in ["sdg", "sustainable development", "goals"]):
        return (
            "**GAIA & SDG Alignment**\n\n"
            "**SDG 11 — Sustainable Cities and Communities**\n"
            "GAIA directly supports Target 11.6 (reduce environmental impact of cities) and "
            "Target 11.b (implement policies for climate adaptation).\n\n"
            "**SDG 13 — Climate Action**\n"
            "By enabling evidence-based climate interventions, GAIA supports Target 13.1 "
            "(strengthen resilience) and Target 13.2 (integrate climate measures into planning).\n\n"
            "Every simulation run in GAIA generates quantified SDG impact metrics."
        )

    # Summary / overview
    if any(w in msg_lower for w in ["summary", "overview", "status", "tell me about"]):
        return (
            f"**City Climate Overview**\n\n"
            f"• **{ctx['total_zones']} monitored zones**\n"
            f"• Average surface temperature: **{ctx['avg_temp']}°C**\n"
            f"• Hottest zone: **{ctx['hottest']['zone_name']}** ({ctx['hottest']['surface_temperature']}°C)\n"
            f"• Coolest zone: **{ctx['coolest']['zone_name']}** ({ctx['coolest']['surface_temperature']}°C)\n"
            f"• Most at-risk: **{ctx['highest_risk']['zone_name']}** (risk score: {ctx['highest_risk']['heat_risk_score']})\n\n"
            f"The city needs targeted interventions in high-density, low-green-cover zones. "
            f"Use the Simulation Lab to model specific scenarios."
        )

    # Default helpful response
    return (
        "I'm GAIA, your climate planning assistant. I can help you with:\n\n"
        "• **Zone analysis** — Ask about any zone (e.g., 'Tell me about Zone Z04')\n"
        "• **Heat insights** — 'Which is the hottest zone?'\n"
        "• **Green cover** — 'What's the green cover status?'\n"
        "• **Recommendations** — 'What's the best intervention?'\n"
        "• **Climate concepts** — 'Explain Urban Heat Islands'\n"
        "• **SDG alignment** — 'How does GAIA align with SDGs?'\n"
        "• **City overview** — 'Give me a summary'\n\n"
        "Try asking a specific question about your city's climate data!"
    )


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """Process a chat message with the AI climate assistant."""
    if not req.messages:
        return ChatResponse(reply="Hello! I'm GAIA, your climate planning assistant. How can I help?")

    # Get the latest user message
    user_msg = req.messages[-1].content
    ctx = build_zone_context()

    reply = process_message(user_msg, ctx)
    return ChatResponse(reply=reply)
