import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MetricsStackNavigator from "./MetricsStackNavigator";
import DefaultScreen from "../screens/DefaultScreen";
import { Ionicons } from "@expo/vector-icons";
import MetricsScreen from "../screens/MetricsScreen";
import { colors } from "../components/styles/colors";
import AlertsScreen from "../screens/AlertsScreen";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Metrics") {
            iconName = focused ? "bar-chart" : "bar-chart-outline";
          } else if (route.name === "Alerts") {
            iconName = focused ? "alert-circle" : "alert-circle-outline";
          } else if (route.name === "AI") {
            iconName = focused ? "sparkles" : "sparkles-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.PRIMARY,
        tabBarInactiveTintColor: `${colors.PRIMARY}88`,
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "600",
          paddingBottom: 4, // espacio entre texto e ícono
        },
        tabBarStyle: {
          paddingBottom: 5, // espacio adicional debajo del label
          height: 60, // puedes ajustar si quieres más espacio general
        },
      })}
    >
      <Tab.Screen
        name="Metrics"
        component={MetricsScreen}
        options={{
          headerShown: false,
          tabBarLabel: "Metrics",
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          headerShown: false,
          tabBarLabel: "Alerts",
        }}
      />
      <Tab.Screen
        name="AI"
        component={DefaultScreen}
        options={{
          headerShown: false,
          tabBarLabel: "AI",
        }}
      />
      <Tab.Screen
        name="Settings"
        component={DefaultScreen}
        options={{
          headerShown: false,
          tabBarLabel: "Settings",
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
