import numpy as np

def predict_future_efficiency(model, df_case, scaler_X, scaler_y, features_columns, full_df, seq_len=10, future_steps=500):
    X_case = scaler_X.transform(df_case.drop(columns=['eficiencia']))
    last_seq = X_case[-seq_len:]
    current_seq = last_seq.copy()

    future_preds = []
    for _ in range(future_steps):
        pred = model.predict(current_seq[np.newaxis, :, :], verbose=0)[0, 0]
        future_preds.append(pred)
        next_input = current_seq[-1].copy()
        hour_idx = list(features_columns).index('filter_operating_hours')
        next_input[hour_idx] += 1 / full_df['filter_operating_hours'].max()
        current_seq = np.vstack((current_seq[1:], next_input))

    eficiencia_real = scaler_y.inverse_transform(np.array(future_preds).reshape(-1, 1)).flatten()
    ultima_hora = df_case['filter_operating_hours'].iloc[-1]
    horas_futuras = np.arange(ultima_hora + 1, ultima_hora + 1 + future_steps)

    return eficiencia_real, horas_futuras
