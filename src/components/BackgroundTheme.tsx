import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Svg, { Defs, Pattern as SvgPattern, Rect } from 'react-native-svg';

const BackgroundTheme = () => {
  const theme = useTheme();
  const tileSize = 60; // background-size
  const stripeWidth = 30; // first color stop width
  const angleDeg = 32; // linear-gradient angle

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.background }]}> 
      <Svg width="100%" height="100%">
        <Defs>
          <SvgPattern
            id="bgPattern"
            width={tileSize}
            height={tileSize}
            x={-5}
            y={-5}
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${angleDeg})`}
          >
            <Rect x={0} y={0} width={stripeWidth} height={tileSize} fill="rgba(8,8,8,0.74)" />
          </SvgPattern>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#bgPattern)" />
      </Svg>
    </View>
  );
};

export default BackgroundTheme;
