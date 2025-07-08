import pandas as pd
import numpy as np

# Parámetros iniciales
params = ['pH', 'Temperatura (°C)', 'Turbidez (NTU)', 'Conductividad (uS/cm)', 'Color (PCU)']
initial_values = np.array([10.45, 20.8, 336, 1729, 1523.3])
filtered_values = np.array([7.89, 20.0, 184, 191, 975])

# Eficiencia inicial
efficiency_0 = 1 - (filtered_values / initial_values)

# Decaimiento por hora
daily_decay = 0.05
# Si quieres que el decaimiento se base en días completos:
# decay_rate_per_hour = daily_decay / 1
# Si quieres que sea más suave y gradual por hora:
decay_rate_per_hour = daily_decay / 24

# Tiempo simulado: 30 días * 8 horas = 240 registros
n_days = 30
hours_per_day = 8
total_hours = n_days * hours_per_day

rows = []

for hour in range(total_hours):
    day = hour // hours_per_day + 1
    hour_in_day = hour % hours_per_day + 1

    row = {
        'day': day,
        'hour_in_day': hour_in_day,
        'filter_operating_hour': hour
    }

    # Simulación de cada parámetro
    efficiencies = []
    for i, param in enumerate(params):
        raw = initial_values[i]
        eff = efficiency_0[i] * np.exp(-decay_rate_per_hour * hour)
        filtered = raw * (1 - eff)

        # Guardar
        row[f'in_{param.lower().split()[0]}'] = raw
        row[f'out_{param.lower().split()[0]}'] = filtered

        efficiencies.append(eff)

    # Promedio de eficiencia global
    row['eficiencia'] = np.mean(efficiencies) * 100

    rows.append(row)

# Convertir a DataFrame
df = pd.DataFrame(rows)

# Guardar CSV
df.to_csv("dataset_30dias_8horas.csv", index=False)

print("✅ Dataset generado y guardado como dataset_30dias_8horas.csv")
