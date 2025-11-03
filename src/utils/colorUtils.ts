/**
 * Utilities for color manipulation and validation
 */

/**
 * Validates if a string is a valid HEX color
 */
export const isValidRGB = (rgb: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(rgb);
};

/**
 * Calculates luminance to determine if text should be dark or light
 */
export const getContrast = (hexColor: string): 'dark' | 'light' => {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  
  // Calculate luminance (perceived brightness)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return 'dark' for light colors, 'light' for dark colors
  return luminance > 0.5 ? 'dark' : 'light';
};

/**
 * Checks if a color is light (needs dark text)
 */
export const isCorClara = (hexColor: string): boolean => {
  return getContrast(hexColor) === 'dark';
};

/**
 * Returns a valid color with fallback
 */
export const corComFallback = (rgb?: string): string => {
  if (!rgb || !isValidRGB(rgb)) {
    return '#CCCCCC'; // Gray default
  }
  return rgb;
};

/**
 * Adjusts brightness of a color
 * @param hex - Hex color string
 * @param percent - Percentage to adjust (-100 to 100)
 */
export const adjustBrightness = (hex: string, percent: number): string => {
  const color = hex.replace('#', '');
  const num = parseInt(color, 16);
  
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
  
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

/**
 * Map of pigment colors
 */
export const coresPigmentos: Record<string, string> = {
  "Preto": "#000000",
  "Branco": "#FFFFFF",
  "Vermelho": "#FF0000",
  "Amarelo": "#FFFF00",
  "Azul": "#0000FF",
  "Verde": "#00FF00",
  "Laranja": "#FF8000",
  "Marrom": "#8B4513",
  "Violeta": "#8B00FF",
  "Magenta": "#FF00FF",
  "Ciano": "#00FFFF",
};
