abstract class AbstractStorage {
  public abstract has(key: string): boolean;

  public abstract get<T>(key: string): T | null;

  public abstract set<T>(key: string, value: T): void;

  public abstract remove(key: string): void;
}

class StorageService extends AbstractStorage {
  protected driver: Storage;

  public constructor(driver: Storage) {
    super();

    this.driver = driver;
  }

  public has(key: string): boolean {
    return this.driver.getItem(key) !== null;
  }

  public set(key: string, value: unknown) {
    this.driver.setItem(key, JSON.stringify(value));
  }

  public remove(key: string) {
    this.driver.removeItem(key);
  }

  public get<T>(key: string): T | null {
    try {
      if (this.has(key)) {
        return JSON.parse(this.driver.getItem(key) ?? "");
      }
    } catch {
      return null;
    }

    return null;
  }
}

export const storageSvc = new StorageService(window.localStorage);

export const sessionStorageSvc = new StorageService(window.sessionStorage);
