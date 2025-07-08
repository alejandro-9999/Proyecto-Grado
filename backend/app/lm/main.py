from train import simulate_data, train_lstm_model
from predict import predict_future_efficiency
from plot import plot_efficiency_projection
from data_loader import load_real_data
import os
from load_mode import load_trained_model

def main():
    df = simulate_data()
    
    if not os.path.exists("backend/app/lm/models/lstm_model.h5"):
        print("🔁 Entrenando modelo LSTM...")
        model, scaler_X, scaler_y, features_columns = train_lstm_model(df)
    else:
        print("✅ Cargando modelo ya entrenado...")
        model, scaler_X, scaler_y, features_columns = load_trained_model()
        

    test_cases = {
        'Filtro Nuevo (0-100 horas)': df.iloc[:100],
        'Filtro a Medio Usar (100-200 horas)': df.iloc[100:200],
        'Filtro por Fallar (200-300 horas)': df.iloc[200:],
    }

    
    for name, df_case in test_cases.items():
        eficiencia_real, horas_futuras = predict_future_efficiency(
            model, df_case, scaler_X, scaler_y, features_columns, df
        )
        plot_efficiency_projection(df_case, eficiencia_real, horas_futuras, name)

if __name__ == "__main__":
    main()
