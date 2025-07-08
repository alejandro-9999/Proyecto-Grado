import numpy as np
import matplotlib.pyplot as plt

def plot_efficiency_projection(df_case, eficiencia_real, horas_futuras, case_name):
    ultima_hora = df_case['filter_operating_hours'].iloc[-1]
    cruce = np.where(eficiencia_real < 70)[0]
    hora_cambio = horas_futuras[cruce[0]] if len(cruce) > 0 else None

    print(f"\n📊 {case_name}")
    print(f"🔹 Horas actuales de operación: {ultima_hora}h")

    if hora_cambio:
        vida_util_restante = hora_cambio - ultima_hora
        print(f"🔧 Requiere cambio en la hora: {hora_cambio}h")
        print(f"⏳ Vida útil restante estimada: {vida_util_restante:.1f} horas")
    else:
        print(f"✅ No se requiere cambio en las próximas {len(horas_futuras)} horas")

    plt.figure(figsize=(10, 6))
    plt.plot(df_case['filter_operating_hours'], df_case['eficiencia'], 'b-', label='Histórico')
    plt.plot(horas_futuras, eficiencia_real, 'r--', label='Proyección')
    plt.axhline(70, color='gray', linestyle=':', label='Umbral crítico')

    if hora_cambio:
        plt.axvline(hora_cambio, color='green', linestyle='--',
                    label=f'Cambio recomendado: {hora_cambio} hrs')

    plt.title(case_name)
    plt.xlabel('Horas de Operación')
    plt.ylabel('Eficiencia (%)')
    plt.grid(True)
    plt.legend()
    plt.tight_layout()
    plt.show()
