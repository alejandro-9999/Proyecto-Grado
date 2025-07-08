import numpy as np
import matplotlib.pyplot as plt

# Parámetros medidos
params = ['pH', 'Temperatura (°C)', 'Turbidez (NTU)', 'Conductividad (uS/cm)', 'Color (PCU)']
initial_values = np.array([10.45, 20.8, 336, 1729, 1523.3])   # Sin filtrar
filtered_values = np.array([7.89, 20.0, 184, 191, 975])       # Post-filtrado

# Límites recomendados de referencia (OMS u otros estándares)
limits = {
    'pH': (6.5, 8.5),
    'Temperatura (°C)': (None, 25),        # Máx 25°C
    'Turbidez (NTU)': (None, 5),           # Máx 5 NTU
    'Conductividad (uS/cm)': (None, 500),  # Máx 500 µS/cm
    'Color (PCU)': (None, 15),             # Máx 15 PCU
}

# Tiempo simulado (días)
days = np.arange(0, 46)

# Eficiencia inicial y tasa de pérdida
efficiency_0 = 1 - (filtered_values / initial_values)
decay_rate = 0.05  # Puedes ajustar este valor

# Simular valores filtrados degradándose con el tiempo
simulated = []
for i in range(len(params)):
    raw = initial_values[i]
    treated = []
    for t in days:
        efficiency = efficiency_0[i] * np.exp(-decay_rate * t)
        value = raw * (1 - efficiency)
        treated.append(value)
    simulated.append(treated)

# Crear una gráfica por parámetro
for i in range(len(params)):
    param = params[i]
    plt.figure(figsize=(8, 5))
    
    # Curva simulada
    plt.plot(days, simulated[i], label='Filtrado simulado', color='blue')
    
    # Líneas de referencia
    plt.axhline(y=initial_values[i], color='red', linestyle='--', label='Valor sin filtrar')
    plt.axhline(y=filtered_values[i], color='green', linestyle='--', label='Valor filtrado día 0')
    
    # Límites recomendados
    limit_min, limit_max = limits[param]
    if limit_min is not None:
        plt.axhline(y=limit_min, color='orange', linestyle=':', label='Límite inferior recomendado')
    if limit_max is not None:
        plt.axhline(y=limit_max, color='purple', linestyle=':', label='Límite superior recomendado')
    
    # Marcar visualmente excedencia
    sim_values = np.array(simulated[i])
    exceed = (limit_max is not None) & (sim_values > limit_max)
    if exceed.any():
        plt.fill_between(days, limit_max, sim_values, where=exceed, color='pink', alpha=0.3, label='Excede límite')
    
    plt.title(f"Evolución del parámetro: {param}")
    plt.xlabel("Días de uso del filtro")
    plt.ylabel(f"{param}")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.show()
