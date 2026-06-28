// =====================================================================
//  Design tokens for the FYP Archive mobile app.
//  ACTIVE THEME: "PAU Blue" — white surfaces, PAU navy accent, logo on.
//
//  To switch looks, overwrite this file:
//    • Classic brown (no logo):  copy theme.classic.js  -> theme.js
//    • PAU Blue   (with logo):   copy theme.blue.js     -> theme.js
//  then reload the app (npx expo start -c).
// =====================================================================

export const colors = {
  ink: '#15203c',
  inkSoft: '#44506b',
  inkFaint: '#8893ab',
  parchment: '#eef2f9',
  surface: '#ffffff',
  surfaceEdge: '#dde3ef',
  gold: '#233a8c',      // primary accent — PAU navy
  goldDeep: '#182a66',
  goldWash: '#e6eaf7',
  teal: '#1f5c54',
  tealWash: '#e3f0e7',
  danger: '#a63d2f',
  dangerWash: '#f6e3df',
  white: '#ffffff',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 9, md: 14, pill: 100 };

export const fonts = {
  displayMedium: 'Fraunces_500Medium',
  displaySemiBold: 'Fraunces_600SemiBold',
  bodyRegular: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemiBold: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
};

export const shadow = {
  card: { shadowColor: '#15203c', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 3 },
};

export const themeName = 'blue';
export const showLogo = true;
