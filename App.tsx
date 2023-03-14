import {Platform, SafeAreaView, StyleSheet} from 'react-native';
import FamilyInput from "./src/pages/FamilyInput";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {NavigationContainer} from "@react-navigation/native";
import DragDrop from "./src/pages/DragDrop";

export default function App() {
  const Tab = createBottomTabNavigator();

  return (
      <SafeAreaView style={styles.container}>
          <NavigationContainer>
              <Tab.Navigator screenOptions={{headerShown: false, tabBarLabelStyle: {fontSize: 20, fontWeight: '500', paddingBottom: 10}, tabBarIconStyle: { display: "none" }}}>
                  <Tab.Screen name="Funcy Input" component={FamilyInput} />
                  <Tab.Screen name="Drag Defi Team" component={DragDrop} />
              </Tab.Navigator>
          </NavigationContainer>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 50 : 0
  },
});
