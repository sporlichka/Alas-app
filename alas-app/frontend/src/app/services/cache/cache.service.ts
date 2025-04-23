import { Injectable } from '@angular/core';
import { CacheEntry } from '../../types/types';

@Injectable({
  providedIn: 'root',
})
export class CacheService<T> {
  private cache: Map<string, CacheEntry<T>> = new Map<string, CacheEntry<T>>();

  constructor() {}

  public get(key: string): T | null {
    const entry = this.cache.get(key);

    if (entry) {
      if (Date.now() < entry.expiry) {
        return entry.data;
      } else {
        this.cache.delete(key);
      }
    }
    return null;
  }

  public set(key: string, data: T, duration: number): void {
    const expiry = Date.now() + duration;
    this.cache.set(key, { data, expiry });
  }

  public clear(key: string): void {
    this.cache.delete(key);
  }
}
