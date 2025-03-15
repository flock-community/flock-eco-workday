/**
 * LocalStorageManager utility for managing user preferences in localStorage
 * Provides type-safe access to localStorage with proper error handling
 */

// Prefix for all localStorage keys to avoid collisions with other applications
const STORAGE_PREFIX = 'flock-app-';

/**
 * Get a value from localStorage by key
 * @param key The key to retrieve
 * @param defaultValue Optional default value if key doesn't exist
 * @returns The stored value (parsed from JSON) or defaultValue if not found
 */
export const getStorageItem = <T>(key: string, defaultValue?: T): T | undefined => {
  try {
    const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return defaultValue;
  }
};

/**
 * Set a value in localStorage
 * @param key The key to store value under
 * @param value The value to store (will be converted to JSON)
 * @returns boolean indicating success or failure
 */
export const setStorageItem = <T>(key: string, value: T): boolean => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    return false;
  }
};

/**
 * Remove a value from localStorage
 * @param key The key to remove
 * @returns boolean indicating success or failure
 */
export const removeStorageItem = (key: string): boolean => {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
    return false;
  }
};

/**
 * Clear all app-related localStorage items
 * Only clears items with the app prefix
 * @returns boolean indicating success or failure
 */
export const clearStorage = (): boolean => {
  try {
    // Only clear keys that start with our prefix
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Check if localStorage is available in the current browser
 * @returns boolean indicating if localStorage is available
 */
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = `${STORAGE_PREFIX}test`;
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Create a namespaced localStorage manager for a specific feature
 * This helps organize related settings under a common prefix
 * @param namespace The namespace for this group of settings
 * @returns Object with getter and setter methods for the namespace
 */
export const createNamespacedStorage = (namespace: string) => {
  const namespacedKey = (key: string) => `${namespace}.${key}`;
  
  return {
    /**
     * Get a value from the namespaced localStorage
     * @param key The key to retrieve (will be prefixed with namespace)
     * @param defaultValue Optional default value if key doesn't exist
     * @returns The stored value or defaultValue if not found
     */
    get: <T>(key: string, defaultValue?: T): T | undefined => 
      getStorageItem<T>(namespacedKey(key), defaultValue),
    
    /**
     * Set a value in the namespaced localStorage
     * @param key The key to store value under (will be prefixed with namespace)
     * @param value The value to store
     * @returns boolean indicating success or failure
     */
    set: <T>(key: string, value: T): boolean => 
      setStorageItem<T>(namespacedKey(key), value),
    
    /**
     * Remove a value from the namespaced localStorage
     * @param key The key to remove (will be prefixed with namespace)
     * @returns boolean indicating success or failure
     */
    remove: (key: string): boolean => 
      removeStorageItem(namespacedKey(key)),
    
    /**
     * Clear all keys in this namespace
     * @returns boolean indicating success or failure
     */
    clearNamespace: (): boolean => {
      try {
        // Only clear keys that start with our namespaced prefix
        const fullPrefix = `${STORAGE_PREFIX}${namespace}.`;
        Object.keys(localStorage)
          .filter(key => key.startsWith(fullPrefix))
          .forEach(key => localStorage.removeItem(key));
        return true;
      } catch (error) {
        console.error(`Error clearing namespace ${namespace}:`, error);
        return false;
      }
    }
  };
};

// Example usage:
// const userPreferences = createNamespacedStorage('userPreferences');
// userPreferences.set('showWeekends', true);
// const showWeekends = userPreferences.get('showWeekends', false);
