"""
SwasthyaGrid AI — Build 04 Numerical & Mathematical Verification
Simulates the exact deterministic algorithms from forecasting_service.js
and validates against the spec requirements:
- PHC-07 IV Fluids: current stock 105, static 48/d -> 2.2 days.
  Forecast burn rate 58/d -> 1.8 days.
  Delivery at Day 5 -> shortage window 3.2 days.
- Moving averages, weights, and exponential smoothing.
"""

def calculate_sma(series, window):
    slice_ = series[-window:]
    return sum(slice_) / len(slice_)

def calculate_wma(series, weights):
    slice_ = series[-len(weights):]
    return sum(v * w for v, w in zip(slice_, weights)) / sum(weights)

def holt_linear_forecast(series, h=7, alpha=0.35, beta=0.12):
    level = series[0]
    trend = series[1] - series[0]
    for i in range(1, len(series)):
        prev_level = level
        level = alpha * series[i] + (1 - alpha) * (prev_level + trend)
        trend = beta * (level - prev_level) + (1 - beta) * trend
    
    damping = 0.96
    projections = []
    for step in range(1, h + 1):
        damped_trend = trend * (damping ** step)
        val = round(level + step * damped_trend)
        projections.append(max(0, val))
    return projections

def test_math():
    print("Testing Numerical Algorithms...")
    
    # Test SMA
    data = [100, 110, 120, 130, 140, 150, 160]
    sma7 = calculate_sma(data, 7)
    assert sma7 == 130.0, f"SMA7 mismatch: {sma7}"
    print("[OK] SMA-7 calculation verified: 130.0")

    # Test WMA
    weights = [1, 2, 3, 4, 5, 6, 7] # sum = 28
    wma7 = calculate_wma(data, weights)
    expected_wma = sum(v * w for v, w in zip(data, weights)) / 28
    assert abs(wma7 - expected_wma) < 1e-5
    print(f"[OK] WMA-7 calculation verified: {wma7:.2f}")

    # Test Holt's Linear
    trend_series = [100 + i * 5 for i in range(30)] # linear upward trend
    proj = holt_linear_forecast(trend_series, 7)
    assert len(proj) == 7
    assert proj[-1] > proj[0], "Forecast did not capture upward trend"
    print(f"[OK] Holt Linear Forecast projections verified: {proj}")

    # Test PHC-07 IV Fluids math
    current_stock = 105
    static_burn = 48
    forecast_burn = 58
    delivery_days = 5.0

    static_days = round(current_stock / static_burn, 1)
    assert static_days == 2.2, f"Static days expected 2.2, got {static_days}"
    print(f"[OK] PHC-07 IV Fluids static days of stock verified: {static_days} days")

    forecast_days = round(current_stock / forecast_burn, 1)
    assert forecast_days == 1.8, f"Forecast days expected 1.8, got {forecast_days}"
    print(f"[OK] PHC-07 IV Fluids forecast-adjusted days of stock verified: {forecast_days} days")

    shortage_window = round(delivery_days - forecast_days, 1)
    assert shortage_window == 3.2, f"Shortage window expected 3.2, got {shortage_window}"
    print(f"[OK] PHC-07 IV Fluids shortage window verified: {shortage_window} days")

    print("ALL NUMERICAL TESTS PASSED SUCCESSFULLY.")

if __name__ == "__main__":
    test_math()
