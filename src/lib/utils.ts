import { ASSET_COLOR_PRESETS } from './constants';

/**
 * Generates a random color that is not in the usedColors list.
 * Prioritizes unused presets, then falls back to random hex colors.
 */
export const generateUniqueRandomColor = (usedColors: string[]): string => {
  const normalizedUsedColors = usedColors.map(c => c.toLowerCase());
  const unusedPresets = ASSET_COLOR_PRESETS.filter(p => !normalizedUsedColors.includes(p.toLowerCase()));
  if (unusedPresets.length > 0) {
    return unusedPresets[Math.floor(Math.random() * unusedPresets.length)];
  }
  
  let color;
  let attempts = 0;
  do {
    color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    attempts++;
    if (attempts > 100) break;
  } while (normalizedUsedColors.includes(color.toLowerCase()));
  
  return color.toLowerCase();
};
