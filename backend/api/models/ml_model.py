"""
ML prediction model wrapper for GAIA.
Loads trained model and provides prediction interface.
"""
import os
import numpy as np
import pandas as pd
import joblib

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "model.joblib")
ZONES_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "city_zones.csv")
TRENDS_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "monthly_trends.csv")

FEATURES = [
    "green_cover_pct",
    "building_density",
    "population_density",
    "albedo",
    "road_surface_pct",
    "water_body_proximity_km",
]


class ClimateModel:
    """Wrapper around the trained climate prediction model."""

    def __init__(self):
        self.model = None
        self.zones_df = None
        self.trends_df = None
        self._load()

    def _load(self):
        """Load model and zone data."""
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)
            print(f"  ML model loaded from {MODEL_PATH}")
        else:
            print(f"  WARNING: Model not found at {MODEL_PATH}. Run ml/train.py first.")

        if os.path.exists(ZONES_PATH):
            self.zones_df = pd.read_csv(ZONES_PATH)
            print(f"  Zone data loaded: {len(self.zones_df)} zones")
        else:
            print(f"  WARNING: Zone data not found at {ZONES_PATH}. Run data/generate_data.py first.")

        if os.path.exists(TRENDS_PATH):
            self.trends_df = pd.read_csv(TRENDS_PATH)

    def get_zones(self):
        """Return all zone data as list of dicts."""
        if self.zones_df is None:
            return []
        return self.zones_df.to_dict("records")

    def get_zone(self, zone_id: str):
        """Get a single zone's data."""
        if self.zones_df is None:
            return None
        match = self.zones_df[self.zones_df["zone_id"] == zone_id]
        if match.empty:
            return None
        return match.iloc[0].to_dict()

    def get_trends(self, zone_id: str = None):
        """Get monthly temperature trends, optionally filtered by zone."""
        if self.trends_df is None:
            return []
        if zone_id:
            filtered = self.trends_df[self.trends_df["zone_id"] == zone_id]
            return filtered.to_dict("records")
        # Return average across all zones per month
        avg = self.trends_df.groupby(["month", "month_idx"]).agg(
            temperature=("temperature", "mean")
        ).reset_index().sort_values("month_idx")
        return avg.to_dict("records")

    def predict_temperature(self, features: dict) -> float:
        """Predict surface temperature given urban features."""
        if self.model is None:
            # Fallback: simple formula
            return (
                35.0
                + features.get("building_density", 0.5) * 9.5
                - features.get("green_cover_pct", 20) * 0.18
                + (features.get("population_density", 15000) / 20000) * 3.5
                - features.get("albedo", 0.25) * 8.0
                + features.get("road_surface_pct", 30) * 0.05
                - (1 / (features.get("water_body_proximity_km", 3) + 0.5)) * 1.5
            )

        X = pd.DataFrame([{f: features.get(f, 0) for f in FEATURES}])
        return float(self.model.predict(X)[0])

    def simulate_intervention(self, zone_data: dict, intervention: dict) -> dict:
        """
        Simulate a climate intervention on a zone.

        intervention keys:
            tree_increase_pct, green_space_pct, roof_greening_pct, cool_roof_pct, budget_lakhs
        """
        current_features = {f: zone_data[f] for f in FEATURES}
        current_temp = zone_data["surface_temperature"]

        # Calculate modified features based on intervention
        modified = current_features.copy()

        # Tree plantation increases green cover
        tree_boost = intervention.get("tree_increase_pct", 0) * 0.8  # 80% effectiveness
        green_space_boost = intervention.get("green_space_pct", 0) * 0.6
        modified["green_cover_pct"] = min(
            current_features["green_cover_pct"] + tree_boost + green_space_boost, 65.0
        )

        # Roof greening slightly increases effective green cover and albedo
        roof_green = intervention.get("roof_greening_pct", 0)
        modified["green_cover_pct"] = min(modified["green_cover_pct"] + roof_green * 0.2, 65.0)
        modified["albedo"] = min(current_features["albedo"] + roof_green * 0.003, 0.50)

        # Cool roof adoption increases albedo, reduces road surface impact
        cool_roof = intervention.get("cool_roof_pct", 0)
        modified["albedo"] = min(modified["albedo"] + cool_roof * 0.005, 0.55)
        modified["road_surface_pct"] = max(
            current_features["road_surface_pct"] - cool_roof * 0.1, 5.0
        )

        # Predict new temperature
        predicted_temp = self.predict_temperature(modified)
        temp_reduction = round(current_temp - predicted_temp, 2)
        temp_reduction = max(temp_reduction, 0)  # Can't increase temp with interventions

        # Carbon sequestration: new trees × 22 kg CO2/year
        area = zone_data.get("area_sqkm", 10)
        new_green_pct = modified["green_cover_pct"] - current_features["green_cover_pct"]
        new_trees = int(new_green_pct * area * 120)  # ~120 trees per km² per 1% green
        carbon_seq = round(new_trees * 22 / 1000, 2)  # tons CO2/year

        # Sustainability score (0-100)
        budget = intervention.get("budget_lakhs", 100)
        sustainability = min(100, round(
            temp_reduction * 15 + carbon_seq * 3 + new_green_pct * 2, 1
        ))

        # Cost efficiency: impact per lakh spent
        cost_efficiency = round(
            (temp_reduction * 10 + carbon_seq) / max(budget, 1) * 100, 2
        )

        return {
            "zone_id": zone_data["zone_id"],
            "zone_name": zone_data["zone_name"],
            "current_temp": current_temp,
            "predicted_temp": round(predicted_temp, 1),
            "temp_reduction": temp_reduction,
            "carbon_sequestration": carbon_seq,
            "sustainability_score": sustainability,
            "cost_efficiency": cost_efficiency,
            "new_trees": new_trees,
            "modified_green_cover": round(modified["green_cover_pct"], 1),
        }


# Singleton instance
climate_model = ClimateModel()
