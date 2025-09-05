// LocalStorage helpers with namespacing for LeDuo

const NAMESPACE = 'leduo';

export const storage = {
  // Get item with namespace
  get: (key) => {
    try {
      const item = localStorage.getItem(`${NAMESPACE}.${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting from localStorage:', error);
      return null;
    }
  },

  // Set item with namespace
  set: (key, value) => {
    try {
      localStorage.setItem(`${NAMESPACE}.${key}`, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error setting localStorage:', error);
      return false;
    }
  },

  // Remove item
  remove: (key) => {
    try {
      localStorage.removeItem(`${NAMESPACE}.${key}`);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  // Clear all LeDuo data
  clear: () => {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(`${NAMESPACE}.`))
        .forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// Customer data helpers
export const customerStorage = {
  get: () => storage.get('customer'),
  set: (customer) => storage.set('customer', customer),
  update: (updates) => {
    const current = customerStorage.get() || {};
    return storage.set('customer', { ...current, ...updates });
  },
  remove: () => storage.remove('customer')
};

// App state helpers
export const stateStorage = {
  get: () => storage.get('state') || {
    cashbackPoints: 0,
    stamps: 0,
    lastVisit: null,
    roulette: {
      mode: 'weekly', // 'weekly' or 'visits'
      cooldownDays: 7,
      lastSpinAt: null,
      requiredVisits: 5,
      visitsSinceLastSpin: 0
    }
  },
  set: (state) => storage.set('state', state),
  update: (updates) => {
    const current = stateStorage.get();
    return storage.set('state', { ...current, ...updates });
  },
  updateRoulette: (rouletteUpdates) => {
    const current = stateStorage.get();
    return storage.set('state', {
      ...current,
      roulette: { ...current.roulette, ...rouletteUpdates }
    });
  }
};

// Auth helpers
export const authStorage = {
  isLoggedIn: () => storage.get('isLoggedIn') === 'true',
  login: () => storage.set('isLoggedIn', 'true'),
  logout: () => {
    storage.remove('isLoggedIn');
    // Optionally clear all data on logout
    // storage.clear();
  }
};

// Initialize default state if not exists
export const initializeStorage = () => {
  if (!stateStorage.get()) {
    stateStorage.set({
      cashbackPoints: 120, // Demo data
      stamps: 2, // Demo data
      lastVisit: '2025-09-01T12:30:00Z',
      roulette: {
        mode: 'weekly',
        cooldownDays: 7,
        lastSpinAt: '2025-08-30T14:00:00Z',
        requiredVisits: 5,
        visitsSinceLastSpin: 3
      }
    });
  }
};