from train import simulate_data, train_lstm_model
from predict import predict_future_efficiency
from plot import plot_efficiency_projection
from data_loader import load_real_data

def main():
    df = simulate_data()
    model, scaler_X, scaler_y, features_columns = train_lstm_model(df)

    test_cases = {
        'Filtro Nuevo (0-100 horas)': df.iloc[:100],
        'Filtro a Medio Usar (100-200 horas)': df.iloc[100:200],
        'Filtro por Fallar (200-300 horas)': df.iloc[200:],
    }

    # ✅ Cargar datos reales desde MongoDB
    df_real = load_real_data()

    print(df_real)
    
    if not df_real.empty:
        test_cases['Datos Reales Recientes'] = df_real

    for name, df_case in test_cases.items():
        eficiencia_real, horas_futuras = predict_future_efficiency(
            model, df_case, scaler_X, scaler_y, features_columns, df
        )
        plot_efficiency_projection(df_case, eficiencia_real, horas_futuras, name)

if __name__ == "__main__":
    main()
