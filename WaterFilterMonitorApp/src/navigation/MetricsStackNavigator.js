// src/navigation/MetricsStackNavigator.js
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DefaultScreen from "../screens/DefaultScreen";

const Stack = createNativeStackNavigator();

const MetricsStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="MetricsScreen">
      <Stack.Screen 
        name="MetricsScreen" 
        options={{ headerTitle: "Metrics" }} 
        component={DefaultScreen}
      />
       <Stack.Screen 
        name="Detail" 
        component={DefaultScreen} 
        options={({ route }) => ({ 
          title: route.params?.title || 'Detalle',
        })} 
      />
      
      {/* Aquí puedes agregar más pantallas relacionadas con Metrics */}
    </Stack.Navigator>
  );
};

export default MetricsStackNavigator;