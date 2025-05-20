import { styles } from "../components/styles/styles";
import EfficiencyChart from "../components/components/EfficiencyChart";
import { SafeAreaView, ScrollView } from "react-native";

const PredictionScreen = () => {
    return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <EfficiencyChart/>
      </ScrollView>
    </SafeAreaView>
  );
}

export default PredictionScreen;