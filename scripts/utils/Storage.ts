import { StorageOptions } from '../type';
import Codec from './Codec';
import Logger from './Logger';

export default class Storage {
  private static readonly prefix = "LIHKGHelper";

  public static get<T = any>(key: string, options: StorageOptions = {}) {
    const storage = this.getStorage(options);
    try {
      let stringified = storage.getItem(this.getKey(key, options)) as string | null;
      if (options.decompress && stringified) {
        stringified = Codec.decode(stringified);
      }
      return JSON.parse(stringified) as T | null;
    } catch (err) {
      Logger.error(`Error when parsing localStorage data: namespace=${options.namespace}, key=${key}, decompress=${options.decompress}.`);
      Logger.error(err);
      return null;
    }
  }

  public static getAll<T = any>(options: StorageOptions = {}) {
    const storage = this.getStorage(options);
    try {
      return Object
        .entries(storage)
        .filter(([key]) => key.startsWith(this.getKey("", options)))
        .map(([_, value]) => JSON.parse(options.decompress ? Codec.decode(value) : value)) as T[];
    } catch (err) {
      Logger.error(`Error when parsing localStorage data: namespace=${options.namespace}, decompress=${options.decompress}.`);
      Logger.error(err);
      return [];
    }
  }

  public static set(key: string, value: any, options: StorageOptions = {}) {
    const storage = this.getStorage(options);
    try {
      let stringified = JSON.stringify(value);
      if (options.compress) {
        stringified = Codec.encode(stringified);
      }
      storage.setItem(this.getKey(key, options), stringified);
    } catch (err) {
      Logger.error(`Error when setting localStorage data: key=${key}, namespace=${options.namespace}, compress=${options.compress}.`);
      Logger.error(err);
    }
  }

  private static getKey(key: string, options: StorageOptions) {
    if (options.namespace) return `${this.prefix}:${options.namespace}:${key}`;
    return `${this.prefix}:${key}`;
  }

  private static getStorage(options: StorageOptions) {
    return options.session ? window.sessionStorage : window.localStorage;
  }
}