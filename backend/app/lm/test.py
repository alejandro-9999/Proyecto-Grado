import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

# 1. SIMULACIÓN DE DATOS
np.random.seed(0)
n_samples = 300
df = pd.DataFrame({
    'in_ph': np.random.uniform(6.5, 8.5, n_samples),
    'in_color': np.random.uniform(10, 30, n_samples),
    'in_turbidity': np.random.uniform(1, 5, n_samples),
    'in_conductivity': np.random.uniform(200, 500, n_samples),
    'out_ph': np.random.uniform(6.5, 8.0, n_samples),
    'out_color': np.random.uniform(5, 15, n_samples),
    'out_turbidity': np.random.uniform(0.5, 3, n_samples),
    'out_conductivity': np.random.uniform(150, 450, n_samples),
    'filter_operating_hours': np.arange(n_samples),
})
df['eficiencia'] = 100 - (df['filter_operating_hours'] * 0.1) + np.random.normal(0, 1.5, n_samples)
df['eficiencia'] = df['eficiencia'].clip(0, 100)

# 2. ESCALADO
features = df.drop(columns=['eficiencia'])
target = df[['eficiencia']]

scaler_X = MinMaxScaler()
scaler_y = MinMaxScaler()

X_scaled = scaler_X.fit_transform(features)
y_scaled = scaler_y.fit_transform(target)

# 3. CREAR SECUENCIAS
def create_sequences(X, y, seq_length):
    Xs, ys = [], []
    for i in range(len(X) - seq_length):
        Xs.append(X[i:i + seq_length])
        ys.append(y[i + seq_length])
    return np.array(Xs), np.array(ys)

SEQ_LEN = 10
X_seq, y_seq = create_sequences(X_scaled, y_scaled, SEQ_LEN)

# 4. ENTRENAR MODELO LSTM
model = Sequential([
    LSTM(64, input_shape=(X_seq.shape[1], X_seq.shape[2])),
    Dense(1)
])
model.compile(loss='mse', optimizer='adam')
model.fit(X_seq, y_seq, epochs=30, batch_size=16, verbose=0)

# 5. DEFINIR CASOS DE PRUEBA
test_cases = {
    'Filtro Nuevo (0-100 horas)': df.iloc[:100],
    'Filtro a Medio Usar (100-200 horas)': df.iloc[100:200],
    'Filtro por Fallar (200-300 horas)': df.iloc[200:]
}

# 6. PROYECCIONES Y VENTANAS INDEPENDIENTES
future_steps = 500

for case_name, df_case in test_cases.items():
    # Escalar datos del caso
    X_case = scaler_X.transform(df_case.drop(columns=['eficiencia']))
    last_seq = X_case[-SEQ_LEN:]

    # Generar proyección
    future_preds = []
    current_seq = last_seq.copy()

    for _ in range(future_steps):
        pred = model.predict(current_seq[np.newaxis, :, :], verbose=0)[0, 0]
        future_preds.append(pred)
        next_input = current_seq[-1].copy()
        hour_idx = features.columns.get_loc('filter_operating_hours')
        next_input[hour_idx] += 1 / df['filter_operating_hours'].max()
        current_seq = np.vstack((current_seq[1:], next_input))

    # Convertir a valores reales
    eficiencia_real = scaler_y.inverse_transform(np.array(future_preds).reshape(-1, 1)).flatten()
    ultima_hora = df_case['filter_operating_hours'].iloc[-1]
    horas_futuras = np.arange(ultima_hora + 1, ultima_hora + 1 + future_steps)

    # Encontrar punto de cruce
    cruce = np.where(eficiencia_real < 70)[0]
    hora_cambio = horas_futuras[cruce[0]] if len(cruce) > 0 else None

    # Imprimir resultado
    print(f"\n📊 {case_name}")
    print(f"🔹 Horas actuales de operación: {ultima_hora}h")

    if hora_cambio:
        vida_util_restante = hora_cambio - ultima_hora
        print(f"🔧 Requiere cambio en la hora: {hora_cambio}h")
        print(f"⏳ Vida útil restante estimada: {vida_util_restante:.1f} horas")
    else:
        print(f"✅ No se requiere cambio en las próximas {future_steps} horas")

    # Mostrar en ventana separada
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