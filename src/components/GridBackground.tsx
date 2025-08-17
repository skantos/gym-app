import React from "react";
import Svg, { Rect } from "react-native-svg";
import { StyleSheet } from "react-native";

const GridPattern = () => (
  <Svg height="100%" width="100%" style={styles.svg}>
    {/* Patrón de cuadrícula diagonal */}
    {Array.from({ length: 100 }).map((_, i) => (
      <Rect
        key={i}
        x={(i * 30) % 300}
        y={Math.floor(i / 10) * 30}
        width="1.5"
        height="1.5"
        fill="rgba(255, 255, 255, 0.05)"
        transform="rotate(45 0 0)"
      />
    ))}
  </Svg>
);

const styles = StyleSheet.create({
  svg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
});

export default GridPattern;