import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

def simulate_data(n_samples=300):
    np.random.seed(0)
    df = pd.DataFrame({
        'in_ph': np.random.uniform(6.5, 8.5, n_samples),
        'in_color': np.random.uniform(10, 30, n_samples),
        'in_turbidity': np.random.uniform(1, 5, n_samples),
        'in_conductivity': np.random.uniform(200, 500, n_samples),
        'on_ph': np.random.uniform(6.5, 8.0, n_samples),
        'on_color': np.random.uniform(5, 15, n_samples),
        'on_turbidity': np.random.uniform(0.5, 3, n_samples),
        'on_conductivity': np.random.uniform(150, 450, n_samples),
        'filter_operating_hours': np.arange(n_samples),
    })
    df['eficiencia'] = 100 - (df['filter_operating_hours'] * 0.1) + np.random.normal(0, 1.5, n_samples)
    df['eficiencia'] = df['eficiencia'].clip(0, 100)
    return df

def train_lstm_model(df, seq_len=10):
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

    model = Sequential([
        LSTM(64, input_shape=(X_seq.shape[1], X_seq.shape[2])),
        Dense(1)
    ])
    model.compile(loss='mse', optimizer='adam')
    model.fit(X_seq, y_seq, epochs=30, batch_size=16, verbose=0)

    return model, scaler_X, scaler_y, features.columns
