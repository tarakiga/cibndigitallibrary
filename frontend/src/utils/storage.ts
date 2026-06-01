/**
 * Storage utility with safe operations and quota management
 */

/**
 * Safely get an item from storage
 */
export const getItem = (key: string, storage: Storage = localStorage): any => {
  try {
    const item = storage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn(`Error reading ${key} from storage:`, error);
    return null;
  }
};

/**
 * Safely set an item in storage with size check
 */
export const setItem = (
  key: string, 
  value: any, 
  storage: Storage = localStorage
): boolean => {
  try {
    const stringValue = JSON.stringify(value);
    
    // Check if we're likely to exceed quota
    if (stringValue.length > 2 * 1024 * 1024) { // 2MB
      console.warn(`Value for ${key} is too large (${stringValue.length} bytes)`);
      return false;
    }
    
    storage.setItem(key, stringValue);
    return true;
  } catch (error) {
    if (error instanceof DOMException && 
        (error.code === 22 || // Chrome, Firefox
         error.code === 1014 || // Firefox
         error.name === 'QuotaExceededError' ||
         error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      // Storage is full, try to clear some space
      console.warn('Storage is full, attempting to clear old items');
      clearOldItems(storage);
      
      // Try again after clearing
      try {
        storage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.error('Still cannot save to storage after cleanup:', e);
        return false;
      }
    }
    
    console.warn(`Error saving to storage:`, error);
    return false;
  }
};

/**
 * Clear old items from storage to free up space
 */
const clearOldItems = (storage: Storage) => {
  try {
    // Keep these keys
    const keepKeys = new Set(['auth_token', 'user', 'cart_items']);
    
    // Remove old items
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && !keepKeys.has(key)) {
        storage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

/**
 * Check if storage is available
 */
export const isStorageAvailable = (type: 'localStorage' | 'sessionStorage'): boolean => {
  try {
    const storage = window[type];
    const testKey = '__test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Safely store purchased content with size limits
 */
export const storePurchasedContent = (content: any[]): boolean => {
  if (!Array.isArray(content)) {
    console.warn('storePurchasedContent: received non-array data', content);
    return false;
  }

  try {
    // Only store essential data
    const essentialContent = content.map(item => ({
      id: item.id,
      title: item.title,
      type: item.type || 'document',
      price: item.price || 0,
      thumbnail_url: item.thumbnail_url || null,
      isPremium: item.isPremium || false
    }));
    
    // Try to store in sessionStorage first
    if (isStorageAvailable('sessionStorage')) {
      return setItem('purchasedContent', essentialContent, sessionStorage);
    }
    
    // Fall back to localStorage if sessionStorage is not available
    if (isStorageAvailable('localStorage')) {
      return setItem('purchasedContent', essentialContent, localStorage);
    }
    
    return false;
  } catch (error) {
    console.warn('Error storing purchased content:', error);
    return false;
  }
};

/**
 * Get purchased content from storage
 */
export const getPurchasedContent = (): any[] => {
  try {
    // Try sessionStorage first
    if (isStorageAvailable('sessionStorage')) {
      const sessionData = getItem('purchasedContent', sessionStorage);
      if (sessionData) return sessionData;
    }
    
    // Fall back to localStorage
    if (isStorageAvailable('localStorage')) {
      const localData = getItem('purchasedContent', localStorage);
      if (localData) return localData;
    }
    
    return [];
  } catch (error) {
    console.warn('Error getting purchased content:', error);
    return [];
  }
};
