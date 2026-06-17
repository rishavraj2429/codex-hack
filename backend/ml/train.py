"""
ML model training for GAIA climate prediction pipeline.
Trains an XGBoost regressor on synthetic urban climate data.
"""

import os
import sys

import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

# Add parent dir to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

try:
    from xgboost import XGBRegressor
    USE_XGBOOST = True
except ImportError:
    from sklearn.ensemble import RandomForestRegressor
    USE_XGBOOST = False
    print("XGBoost not available, falling back to RandomForest")

FEATURES = [
    "green_cover_pct",
    "building_density",
    "population_density",
    "albedo",
    "road_surface_pct",
    "water_body_proximity_km",
]

TARGET = "surface_temperature"

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.joblib")
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "training_data.csv")


def train_model():
    """Train and save the climate prediction model."""
    print("Loading training data...")
    df = pd.read_csv(DATA_PATH)
    print(f"  {len(df)} samples loaded")

    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print("Training model...")
    if USE_XGBOOST:
        model = XGBRegressor(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            verbosity=0,
        )
    else:
        model = RandomForestRegressor(
            n_estimators=200,
            max_depth=10,
            random_state=42,
        )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"\nModel Performance:")
    print(f"  MAE:  {mae:.3f} °C")
    print(f"  R²:   {r2:.4f}")

    if hasattr(model, "feature_importances_"):
        print("\nFeature Importance:")
        for feat, imp in sorted(
            zip(FEATURES, model.feature_importances_), key=lambda x: -x[1]
        ):
            print(f"  {feat:30s} {imp:.4f}")

    joblib.dump(model, MODEL_PATH)
    print(f"\nModel saved to {MODEL_PATH}")

    return model


if __name__ == "__main__":
    train_model()
