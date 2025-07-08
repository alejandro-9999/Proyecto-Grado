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

    if not df_real.empty:
        df_real = df_real.drop('_id', axis=1)
        df_real = df_real.drop(columns=['timestamp'])  # Eliminar aquí está bien si no está en features_columns

        
        column_list = list(features_columns)
        
        column_list.append('eficiencia')
        
        # ✅ Reorganizar columnas al mismo orden que el entrenamiento
        df_real = df_real[column_list]

        
        
        eficiencia_real, horas_futuras = predict_future_efficiency(
            model, df_real, scaler_X, scaler_y, features_columns, df
        )

        plot_efficiency_projection(df_real, eficiencia_real, horas_futuras, 'Grafica Realista')

if __name__ == "__main__":
    main()
