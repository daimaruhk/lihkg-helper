import { Codec, Logger } from '.';

type StorageOptions = {
  session: boolean;
  namespace: string;
  compress: boolean;
  decompress: boolean;
}

export class Storage {
  private static readonly prefix = "LIHKGHelper";

  public static get<T = any>(key: string, options?: Partial<StorageOptions>) {
    const _options = this.parseOptions(options);
    const storage = this.getStorage(_options);
    try {
      let stringified = storage.getItem(this.getKey(key, _options)) as string | null;
      if (_options.decompress && stringified) {
        stringified = Codec.decode(stringified);
      }
      return JSON.parse(stringified) as T | null;
    } catch (err) {
      Logger.error('Error when getting storage data:');
      Logger.error(_options);
      Logger.error(err);
      return null;
    }
  };

  public static getAll<T = any>(options?: Partial<StorageOptions>) {
    const _options = this.parseOptions(options);
    const storage = this.getStorage(_options);
    try {
      return Object
        .entries(storage)
        .filter(([key]) => key.startsWith(this.getKey("", _options)))
        .map(([_, value]) => JSON.parse(_options.decompress ? Codec.decode(value) : value)) as T[];
    } catch (err) {
      Logger.error('Error when getting all storage data:');
      Logger.error(_options);
      Logger.error(err);
      return [];
    }
  };

  public static set(key: string, value: any, options?: Partial<StorageOptions>) {
    const _options = this.parseOptions(options);
    const storage = this.getStorage(_options);
    try {
      let stringified = JSON.stringify(value);
      if (_options.compress) {
        stringified = Codec.encode(stringified);
      }
      storage.setItem(this.getKey(key, _options), stringified);
    } catch (err) {
      Logger.error('Error when setting storage data:');
      Logger.error(_options);
      Logger.error(err);
    }
  };

  public static delete(key: string, options?: Partial<StorageOptions>) {
    const _options = this.parseOptions(options);
    const storage = this.getStorage(_options);
    storage.removeItem(this.getKey(key, _options));
  };

  private static getKey(key: string, options: StorageOptions) {
    if (options.namespace !== "") return `${this.prefix}:${options.namespace}:${key}`;
    return `${this.prefix}:${key}`;
  };

  private static getStorage(options: StorageOptions) {
    return options.session ? window.sessionStorage : window.localStorage;
  };

  private static parseOptions(options: Partial<StorageOptions> = {}): StorageOptions {
    return {
      session: options.session ?? false,
      namespace: options.namespace ?? "",
      compress: options.compress ?? false,
      decompress: options.decompress ?? false
    };
  };
}