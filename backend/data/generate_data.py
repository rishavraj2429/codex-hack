"""
Synthetic climate data generator for GAIA platform.
Generates realistic urban zone data modeled on an Indian metropolitan city.
"""

import csv
import json
import math
import os
import random

import numpy as np

random.seed(42)
np.random.seed(42)

ZONES = [
    {"id": "Z01", "name": "Central Business District", "lat": 17.385, "lng": 78.4867},
    {"id": "Z02", "name": "Old City Core", "lat": 17.361, "lng": 78.474},
    {"id": "Z03", "name": "Tech Park East", "lat": 17.445, "lng": 78.380},
    {"id": "Z04", "name": "Industrial North", "lat": 17.495, "lng": 78.430},
    {"id": "Z05", "name": "Residential South", "lat": 17.340, "lng": 78.520},
    {"id": "Z06", "name": "University Quarter", "lat": 17.420, "lng": 78.520},
    {"id": "Z07", "name": "Lake District", "lat": 17.430, "lng": 78.450},
    {"id": "Z08", "name": "Transport Hub", "lat": 17.433, "lng": 78.500},
    {"id": "Z09", "name": "Market Area", "lat": 17.390, "lng": 78.510},
    {"id": "Z10", "name": "Government Complex", "lat": 17.410, "lng": 78.470},
    {"id": "Z11", "name": "Hospital District", "lat": 17.405, "lng": 78.495},
    {"id": "Z12", "name": "Defence Colony", "lat": 17.440, "lng": 78.440},
    {"id": "Z13", "name": "Outer Ring Road", "lat": 17.460, "lng": 78.360},
    {"id": "Z14", "name": "Heritage Zone", "lat": 17.365, "lng": 78.490},
    {"id": "Z15", "name": "New Township", "lat": 17.480, "lng": 78.390},
    {"id": "Z16", "name": "Cantonment Area", "lat": 17.450, "lng": 78.500},
    {"id": "Z17", "name": "Riverside Ward", "lat": 17.395, "lng": 78.530},
    {"id": "Z18", "name": "Airport Corridor", "lat": 17.370, "lng": 78.430},
    {"id": "Z19", "name": "Suburban East", "lat": 17.410, "lng": 78.560},
    {"id": "Z20", "name": "Green Belt Periphery", "lat": 17.350, "lng": 78.380},
]


def generate_zone_data():
    """Generate comprehensive zone-level climate and urban data."""
    data = []
    for zone in ZONES:
        green_cover = round(random.uniform(5, 42), 1)
        building_density = round(random.uniform(0.25, 0.92), 2)
        population_density = random.randint(4000, 28000)

        # Physics-informed temperature: higher density & lower green → hotter
        base_temp = 35.0
        temp = base_temp + (building_density * 8) - (green_cover * 0.15) + (population_density / 20000) * 3
        temp += random.uniform(-1.5, 1.5)
        temp = round(min(max(temp, 33.0), 47.0), 1)

        albedo = round(0.15 + (1 - building_density) * 0.25 + random.uniform(-0.03, 0.03), 2)
        albedo = min(max(albedo, 0.10), 0.45)

        road_surface_pct = round(building_density * 40 + random.uniform(5, 15), 1)
        road_surface_pct = min(road_surface_pct, 65)

        water_proximity = round(random.uniform(0.1, 8.0), 1)

        # Heat Risk Score (0-100)
        heat_risk = (temp - 33) / (47 - 33) * 60 + (1 - green_cover / 42) * 25 + building_density * 15
        heat_risk = round(min(max(heat_risk, 10), 100), 1)

        # Area in sq km
        area_sqkm = round(random.uniform(3.0, 18.0), 1)

        # Existing tree count estimate
        tree_count = int(green_cover * area_sqkm * random.uniform(80, 200))

        data.append({
            "zone_id": zone["id"],
            "zone_name": zone["name"],
            "latitude": zone["lat"],
            "longitude": zone["lng"],
            "area_sqkm": area_sqkm,
            "green_cover_pct": green_cover,
            "building_density": building_density,
            "population_density": population_density,
            "surface_temperature": temp,
            "albedo": albedo,
            "road_surface_pct": road_surface_pct,
            "water_body_proximity_km": water_proximity,
            "heat_risk_score": heat_risk,
            "tree_count": tree_count,
        })

    return data


def generate_monthly_trends(zones_data):
    """Generate 12-month temperature trend for each zone."""
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    seasonal_offset = [-5, -3, 0, 4, 7, 5, 2, 1, 0, -1, -3, -5]

    trends = []
    for zone in zones_data:
        base = zone["surface_temperature"] - 4  # Annual avg is lower than peak
        for i, month in enumerate(months):
            temp = round(base + seasonal_offset[i] + random.uniform(-0.8, 0.8), 1)
            trends.append({
                "zone_id": zone["zone_id"],
                "month": month,
                "month_idx": i + 1,
                "temperature": temp,
            })

    return trends


def generate_training_data(n_samples=2500):
    """Generate synthetic training data for the ML model."""
    samples = []
    for _ in range(n_samples):
        green_cover = round(random.uniform(2, 50), 1)
        building_density = round(random.uniform(0.1, 0.95), 2)
        population_density = random.randint(2000, 35000)
        albedo = round(random.uniform(0.10, 0.50), 2)
        road_surface_pct = round(random.uniform(10, 65), 1)
        water_proximity = round(random.uniform(0.1, 10.0), 1)

        # Physics-informed target with controlled noise
        temp = (
            35.0
            + building_density * 9.5
            - green_cover * 0.18
            + (population_density / 20000) * 3.5
            - albedo * 8.0
            + road_surface_pct * 0.05
            - (1 / (water_proximity + 0.5)) * 1.5
            + random.gauss(0, 0.8)
        )
        temp = round(min(max(temp, 30.0), 50.0), 1)

        # Carbon sequestration potential (tons CO2/year per km²)
        carbon_potential = round(green_cover * 0.8 + random.uniform(0, 5), 1)

        samples.append({
            "green_cover_pct": green_cover,
            "building_density": building_density,
            "population_density": population_density,
            "albedo": albedo,
            "road_surface_pct": road_surface_pct,
            "water_body_proximity_km": water_proximity,
            "surface_temperature": temp,
            "carbon_sequestration_potential": carbon_potential,
        })

    return samples


def save_csv(data, filename):
    """Save list of dicts to CSV."""
    if not data:
        return
    filepath = os.path.join(os.path.dirname(__file__), filename)
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
    print(f"  Saved {len(data)} rows to {filepath}")


def save_json(data, filename):
    """Save data to JSON."""
    filepath = os.path.join(os.path.dirname(__file__), filename)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"  Saved to {filepath}")


def main():
    print("Generating GAIA synthetic climate data...")

    zones_data = generate_zone_data()
    save_csv(zones_data, "city_zones.csv")
    save_json(zones_data, "city_zones.json")

    trends = generate_monthly_trends(zones_data)
    save_csv(trends, "monthly_trends.csv")

    training_data = generate_training_data(2500)
    save_csv(training_data, "training_data.csv")

    print("Data generation complete.")


if __name__ == "__main__":
    main()
