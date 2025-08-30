import React, { createContext, ReactNode, useContext } from "react";
import { View, StyleSheet } from "react-native";
import GridPattern from "../components/GridPattern";

type Theme = {
  colors: {
    background: string;
    accent: string;
    secondaryAccent: string;
    text: string;
    card: string;
    borderNeon: string;
  };
};

const ThemeContext = createContext<Theme | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme: Theme = {
    colors: {
      background: "#111111",
      accent: "#FF5F00",
      secondaryAccent: "#00D4FF",
      text: "#FFFFFF",
      card: "#1A1A1A",
      borderNeon: "rgba(209, 229, 233, 0.5)",
    },
  };

  return (
    <ThemeContext.Provider value={theme}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.background }]}>
        <GridPattern />
        {children}
      </View>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const t = useContext(ThemeContext);
  if (!t) throw new Error("useTheme must be used within ThemeProvider");
  return t;
};