/**
 * Simple in-memory cache for serverless environments.
 *
 * Note: In serverless environments like Vercel, each function instance has its own
 * memory space and short lifetime. This cache works well for:
 * - Reducing database calls within a single function invocation
 * - Caching across warm function reuses
 *
 * For persistent caching across all instances, consider Vercel KV or Redis.
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  /**
   * Get a cached value if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  /**
   * Set a value in cache with TTL in seconds
   */
  set<T>(key: string, data: T, ttlSeconds: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Check if a key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Invalidate a specific key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all keys matching a pattern (substring match)
   */
  invalidate(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats for debugging
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton cache instance
export const cache = new SimpleCache();

// Cache key builders for consistency
export const CacheKeys = {
  projects: (channelId?: string) => channelId ? `projects:${channelId}` : "projects:all",
  project: (projectId: string) => `project:${projectId}`,
  channels: () => "channels",
  settings: () => "settings",
} as const;

// Default TTL values in seconds
export const CacheTTL = {
  PROJECTS_LIST: 15,      // Short TTL for project lists
  PROJECT_SINGLE: 30,     // Single project details
  CHANNELS: 300,          // 5 minutes for channels (rarely changes)
  SETTINGS: 300,          // 5 minutes for settings (rarely changes)
} as const;

// Status values that indicate a project is in progress and shouldn't be cached
const IN_PROGRESS_STATUSES = [
  "Outline in progress",
  "Sections in creation",
  "Images generating",
  "Voiceover in progress",
];

const IN_PROGRESS_VIDEO_STATUSES = [
  "Section Chunking",
  "Rendering",
  "Finalizing",
];

/**
 * Check if a project should be cached based on its status
 * Projects in progress need real-time updates, so we don't cache them
 */
export function shouldCacheProject(status: string, videoStatus: string | null): boolean {
  if (IN_PROGRESS_STATUSES.includes(status)) {
    return false;
  }
  if (videoStatus && IN_PROGRESS_VIDEO_STATUSES.includes(videoStatus)) {
    return false;
  }
  return true;
}
