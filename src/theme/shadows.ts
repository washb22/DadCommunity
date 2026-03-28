import { Platform } from 'react-native';

const createShadow = (color: string, opacity: number, radius: number, offsetY: number, elevation: number) => ({
  ...Platform.select({
    ios: {
      shadowColor: color,
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: offsetY },
    },
    android: {
      elevation,
    },
  }),
});

export const shadows = {
  level1: createShadow('#2A2A2A', 0.06, 3, 1, 1),
  level2: createShadow('#2A2A2A', 0.08, 8, 2, 3),
  level3: createShadow('#2A2A2A', 0.12, 16, 4, 6),
  level4: createShadow('#3D5A80', 0.35, 16, 6, 8),
  level5: createShadow('#2A2A2A', 0.16, 32, 8, 12),
};
