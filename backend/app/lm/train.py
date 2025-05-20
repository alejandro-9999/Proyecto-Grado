import os
import joblib
import pickle
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
import os
import joblib

def simulate_data(n_samples=300):
    np.random.seed(0)
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
    return df

def train_lstm_model(df, seq_len=10, save_path="backend/app/lm/models"):
    # Prepara los datos
    features = df.drop(columns=['eficiencia'])
    target = df[['eficiencia']]

    scaler_X = MinMaxScaler()
    scaler_y = MinMaxScaler()

    X_scaled = scaler_X.fit_transform(features)
    y_scaled = scaler_y.fit_transform(target)

    def create_sequences(X, y, seq_length):
        Xs, ys = [], []
        for i in range(len(X) - seq_length):
            Xs.append(X[i:i + seq_length])
            ys.append(y[i + seq_length])
        return np.array(Xs), np.array(ys)

    X_seq, y_seq = create_sequences(X_scaled, y_scaled, seq_len)

    # Entrena el modelo
    model = Sequential([
        LSTM(64, input_shape=(X_seq.shape[1], X_seq.shape[2])),
        Dense(1)
    ])
    model.compile(loss='mse', optimizer='adam')
    model.fit(X_seq, y_seq, epochs=30, batch_size=16, verbose=0)

    # ✅ Guarda el modelo y recursos
    os.makedirs(save_path, exist_ok=True)

    # Modelo
    model.save(os.path.join(save_path, "lstm_model.h5"))

    # Escaladores
    joblib.dump(scaler_X, os.path.join(save_path, "scaler_X.pkl"))
    joblib.dump(scaler_y, os.path.join(save_path, "scaler_y.pkl"))

    # Columnas
    joblib.dump(features.columns.tolist(), os.path.join(save_path, "features_columns.pkl"))

    print("✅ Modelo, escaladores y columnas guardados en:", save_path)

    return model, scaler_X, scaler_y, features.columns
