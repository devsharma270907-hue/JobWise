// Color utilities for calculating dynamic hover states, alpha glows, and contrast text

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    return {
      r: parseInt(cleanHex[0] + cleanHex[0], 16),
      g: parseInt(cleanHex[1] + cleanHex[1], 16),
      b: parseInt(cleanHex[2] + cleanHex[2], 16),
    };
  }
  if (cleanHex.length === 6) {
    return {
      r: parseInt(cleanHex.substring(0, 2), 16),
      g: parseInt(cleanHex.substring(2, 4), 16),
      b: parseInt(cleanHex.substring(4, 6), 16),
    };
  }
  return null;
}

export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const adjust = (val: number) => {
    const res = Math.round(val + (val * percent) / 100);
    return Math.min(255, Math.max(0, res)).toString(16).padStart(2, '0');
  };
  return `#${adjust(rgb.r)}${adjust(rgb.g)}${adjust(rgb.b)}`;
}

export function getContrastTextColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#ffffff';
  // Standard luminance formula
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return yiq >= 140 ? '#0f172a' : '#ffffff';
}

export function applyAccentToCss(hex: string): void {
  const rgb = hexToRgb(hex);
  if (!rgb) return;
  const hoverHex = adjustBrightness(hex, -15);
  const fgColor = getContrastTextColor(hex);
  const lightAlpha = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`;
  const glowAlpha = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.28)`;

  const root = document.documentElement;
  root.style.setProperty('--primary', hex);
  root.style.setProperty('--primary-hover', hoverHex);
  root.style.setProperty('--primary-fg', fgColor);
  root.style.setProperty('--primary-light', lightAlpha);
  root.style.setProperty('--primary-glow', glowAlpha);
}
