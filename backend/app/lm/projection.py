import numpy as np

def get_efficiency_projection_data(df_case, eficiencia_real, horas_futuras, case_name="Proyección"):
    ultima_hora = df_case['filter_operating_hours'].iloc[-1]
    cruce = np.where(eficiencia_real < 70)[0]
    hora_cambio = horas_futuras[cruce[0]] if len(cruce) > 0 else None

    result = {
        "case_name": case_name,
        "ultima_hora": float(ultima_hora),
        "hora_cambio": float(hora_cambio) if hora_cambio else None,
        "umbral_critico": 70,
        "historico": [
            {"x": float(h), "y": float(e)}
            for h, e in zip(df_case['filter_operating_hours'], df_case['eficiencia'])
        ],
        "proyeccion": [
            {"x": float(h), "y": float(e)}
            for h, e in zip(horas_futuras, eficiencia_real)
        ]
    }

    if hora_cambio:
        result["vida_util_restante"] = float(hora_cambio - ultima_hora)

    return result
