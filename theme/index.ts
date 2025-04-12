import { MD3LightTheme as PaperDefaultTheme } from 'react-native-paper';

const customColors = {
  primary: '#FF6F91',
  background: '#2D1B69',
  text: '#ffffff',
  error: '#EF4444',
};

export const AppTheme = {
  ...PaperDefaultTheme,
  colors: {
    ...PaperDefaultTheme.colors,
    ...customColors,
  },
};
