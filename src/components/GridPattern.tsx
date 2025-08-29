import React from 'react';
import { View, StyleSheet } from 'react-native';

const GridPattern = () => {
  const gridSize = 40; // Tamaño de cada cuadrado
  const diagonalSize = 20; // Tamaño del gradiente diagonal
  
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Patrón de gradientes diagonales */}
      {Array.from({ length: Math.ceil(1000 / gridSize) + 1 }).map((_, rowIndex) => (
        Array.from({ length: Math.ceil(500 / gridSize) + 1 }).map((_, colIndex) => (
          <View
            key={`${rowIndex}-${colIndex}`}
            style={{
              position: 'absolute',
              top: rowIndex * gridSize - 5, // -5px como en CSS
              left: colIndex * gridSize - 5, // -5px como en CSS
              width: gridSize,
              height: gridSize,
              backgroundColor: 'transparent',
              overflow: 'hidden',
            }}
          >
            {/* Gradiente diagonal simulado */}
            <View
              style={{
                position: 'absolute',
                top: -diagonalSize / 2,
                left: -diagonalSize / 2,
                width: diagonalSize * 2,
                height: diagonalSize * 2,
                backgroundColor: 'rgba(255, 255, 255, 0.03)', // Blanco muy sutil
                transform: [
                  { rotate: '32deg' }, // 32° como en CSS
                  { scale: 1.2 }
                ],
              }}
            />
          </View>
        ))
      ))}
    </View>
  );
};

export default GridPattern;












