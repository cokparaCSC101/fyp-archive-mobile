// =====================================================================
//  Design tokens for the FYP Archive mobile app.
//  Mirrors the web app's "refined academic archive" aesthetic:
//  warm parchment surfaces, deep ink text, scholarly gold accent.
// =====================================================================

export const colors = {
  ink: '#1a1410',
  inkSoft: '#4a4038',
  inkFaint: '#8a7e72',
  parchment: '#f5f0e7',
  surface: '#fffdf8',
  surfaceEdge: '#e7ddcd',
  gold: '#b07d2b',
  goldDeep: '#8a5f1c',
  goldWash: '#f3e8d4',
  teal: '#1f5c54',
  tealWash: '#e3f0e7',
  danger: '#a63d2f',
  dangerWash: '#f6e3df',
  white: '#ffffff',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 9,
  md: 14,
  pill: 100,
};

// Font family names — must match the keys loaded via useFonts in App.js.
export const fonts = {
  displayMedium: 'Fraunces_500Medium',
  displaySemiBold: 'Fraunces_600SemiBold',
  bodyRegular: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemiBold: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
};

export const shadow = {
  card: {
    shadowColor: '#1a1410',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
};
