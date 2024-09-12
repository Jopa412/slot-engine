const LOCAL_STORAGE_KEY = 'SLOT_ENGINE_DATA';

class StorageManager {
  data!: Record<string, any>;
  available = false;
  static instance: StorageManager;

  constructor() {
    this.init();
  }

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }

    return StorageManager.instance;
  }

  init(): void {
    try {
      if (window && window.localStorage) {
        this.available = true;
        const savedData = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        this.data = savedData ? JSON.parse(savedData) : {};
      } else {
        this.data = {};
      }
    } catch (error) {
      this.data = {};
    }
  }

  size(): number {
    return this.data ? Object.keys(this.data).length : 0;
  }

  sync(): void {
    if (!this.available) return;

    if (this.size() === 0) {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      console.info('Storage has been cleared.');
    }

    if (this.size() > 0) {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.data));
      console.info('Storage has been updated.');
    }
  }

  clear(): void {
    this.data = {};
    this.sync();
  }

  set(key: any = null, value: any = null): void {
    if (key && value !== null) {
      this.data[key] = value;
      this.sync();
    }
  }

  get(key: any = null, defaultValue: any = null): any {
    if (!key) {
      return this.data;
    }

    return this.data && typeof this.data[key] !== 'undefined' ? this.data[key] : defaultValue;
  }
}

export default StorageManager;
