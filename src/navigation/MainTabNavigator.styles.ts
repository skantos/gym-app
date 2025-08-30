import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    position: 'relative',
  },
  glowBackground: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    top: 5,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  separatorContainer: {
    position: 'absolute',
    bottom: height * 0.11,
    left: width * 0.05,
    right: width * 0.05,
    height: 2,
    zIndex: 1,
    overflow: 'hidden',
  },
  gradientLine: {
    width: '100%',
    height: '100%',
  },
  tabBarBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    borderRadius: 20,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#FF5F00',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});

export default styles;