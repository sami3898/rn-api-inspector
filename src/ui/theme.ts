export const colors = {
  bg: '#0f0f10',
  panel: '#1a1a1c',
  border: '#27272a',
  text: '#e5e7eb',
  muted: '#71717a',
  success: '#4ade80',
  error: '#f87171',
  accent: '#22d3ee',
  overlay: 'rgba(0,0,0,0.45)',
  chip: '#101012',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 22,
};

export const typography = {
  title: {
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
  body: {
    fontSize: 13,
  },
  caption: {
    fontSize: 11,
  },
};

export const shadow = {
  floating: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
};
