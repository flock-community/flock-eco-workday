import { createNamespacedStorage } from './LocalStorageManager';

/**
 * Manages UI preferences across the application
 */
const uiPreferences = createNamespacedStorage('ui');

/**
 * UI Preference keys
 */
export const UIPreferenceKeys = {
  ENHANCED_UI_ENABLED: 'enhancedUiEnabled',
  // Add more UI preference keys as needed
};

/**
 * Check if enhanced UI is enabled
 * @param defaultValue Default value if setting isn't found (default: false)
 * @returns boolean indicating if enhanced UI is enabled
 */
export const isEnhancedUiEnabled = (defaultValue: boolean = false): boolean => {
  return uiPreferences.get<boolean>(UIPreferenceKeys.ENHANCED_UI_ENABLED, defaultValue);
};

/**
 * Set the enhanced UI preference
 * @param enabled boolean value to enable/disable enhanced UI
 * @returns boolean indicating if the preference was successfully saved
 */
export const setEnhancedUiEnabled = (enabled: boolean): boolean => {
  return uiPreferences.set<boolean>(UIPreferenceKeys.ENHANCED_UI_ENABLED, enabled);
};

export default uiPreferences;
