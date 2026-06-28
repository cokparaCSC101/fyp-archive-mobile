// Colour palettes for the two looks. Theme-independent tokens (fonts,
// spacing, radius, shadow) still live in theme.js.
export const PALETTES = {
  blue: {
    showLogo: true,
    colors: {
      ink: '#15203c', inkSoft: '#44506b', inkFaint: '#8893ab',
      parchment: '#eef2f9', surface: '#ffffff', surfaceEdge: '#dde3ef',
      gold: '#233a8c', goldDeep: '#182a66', goldWash: '#e6eaf7',
      teal: '#1f5c54', tealWash: '#e3f0e7', danger: '#a63d2f', dangerWash: '#f6e3df',
      white: '#ffffff',
    },
  },
  classic: {
    showLogo: false,
    colors: {
      ink: '#1a1410', inkSoft: '#4a4038', inkFaint: '#8a7e72',
      parchment: '#f5f0e7', surface: '#fffdf8', surfaceEdge: '#e7ddcd',
      gold: '#b07d2b', goldDeep: '#8a5f1c', goldWash: '#f3e8d4',
      teal: '#1f5c54', tealWash: '#e3f0e7', danger: '#a63d2f', dangerWash: '#f6e3df',
      white: '#ffffff',
    },
  },
};
