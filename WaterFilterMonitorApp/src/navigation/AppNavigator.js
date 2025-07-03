import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DefaultScreen from "../screens/DefaultScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="Metrics">
            <Stack.Screen name="Metrics" options={{ headerShown: false }} component={DefaultScreen}/>
            {/* <Stack.Screen name="Alerts" options={{ headerShown: false }} />
            <Stack.Screen name="AI" options={{ headerShown: false }} />
            <Stack.Screen name="Settings" options={{ headerShown: false }} /> */}
        </Stack.Navigator>
    );
}

export default AppNavigator;