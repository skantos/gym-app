import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { UserProvider } from "./src/context/UserContext";
import { ThemeProvider } from "./src/context/ThemeContext";

export default function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar />
        </NavigationContainer>
      </ThemeProvider>
    </UserProvider>
  );
}
