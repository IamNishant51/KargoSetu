with open("backend/tests/test_ml_predictor.py", "r") as f:
    code = f.read()

code = code.replace('len(result) == 90', 'len(result["forecast"]) == 90')
code = code.replace('"p50" in result[0]', '"p50" in result["forecast"][0]')
code = code.replace('dates = [r["date"] for r in result]', 'dates = [r["date"] for r in result["forecast"]]')
code = code.replace('res_low = predictor_instance.predict_sync(0.01)', 'res_low = predictor_instance.predict_sync(0.01)["forecast"]')
code = code.replace('res_high = predictor_instance.predict_sync(10.0)', 'res_high = predictor_instance.predict_sync(10.0)["forecast"]')
code = code.replace('res_normal = predictor_instance.predict_sync(1.0)', 'res_normal = predictor_instance.predict_sync(1.0)["forecast"]')
code = code.replace('for r in result:', 'for r in result["forecast"]:')
code = code.replace('for item in result:', 'for item in result["forecast"]:')
code = code.replace('len(result["forecast"]) == 90, f"Expected 90 items, got {len(result)}"', 'len(result["forecast"]) == 90, f"Expected 90 items, got {len(result[\'forecast\'])}"')

with open("backend/tests/test_ml_predictor.py", "w") as f:
    f.write(code)
