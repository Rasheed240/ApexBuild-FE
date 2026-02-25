/**
 * cacheManager.js
 * ───────────────────────────────────────────────────────────────────────────
 * Lightweight in-memory cache for frontend API responses.
 *
 *  · All entries are keyed as: "{orgId}:{userId}:{route-key}"
 *  · TTL is enforced on GET — expired entries are evicted lazily on read.
 *  · clearByPrefix("orgId:userId:resource") enables group invalidation after
 *    mutations (e.g. create/update/delete task → clear all task cache for that org).
 *  · clearAll() is called on logout and org-switch.
 */

class CacheManager {
    constructor() {
        /** @type {Map<string, {value: any, expiresAt: number}>} */
        this._store = new Map();
    }

    // ── Core Operations ───────────────────────────────────────────────────────

    /**
     * Read a cached value. Returns null on MISS or expiry.
     * @param {string} key
     * @returns {any|null}
     */
    get(key) {
        const entry = this._store.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this._store.delete(key);
            return null;
        }

        return entry.value;
    }

    /**
     * Store a value with a TTL (milliseconds).
     * @param {string} key
     * @param {any} value
     * @param {number} ttlMs - Time to live in milliseconds
     */
    set(key, value, ttlMs) {
        if (value === null || value === undefined) return;
        this._store.set(key, {
            value,
            expiresAt: Date.now() + ttlMs,
        });
    }

    /**
     * Remove an exact key.
     * @param {string} key
     */
    remove(key) {
        this._store.delete(key);
    }

    /**
     * Remove every entry whose key starts with `prefix`.
     * Used for group-invalidation after mutations.
     * @param {string} prefix
     */
    clearByPrefix(prefix) {
        for (const key of this._store.keys()) {
            if (key.startsWith(prefix)) {
                this._store.delete(key);
            }
        }
    }

    /**
     * Remove all entries. Called on logout or organization switch.
     */
    clearAll() {
        this._store.clear();
    }

    // ── Utility ───────────────────────────────────────────────────────────────

    /**
     * Build a namespaced key scoped to an org and user to prevent data leakage.
     * @param {string|null} orgId
     * @param {string|null} userId
     * @param {string} resourceKey  e.g. "projects:list:pg:1:10"
     * @returns {string}
     */
    buildKey(orgId, userId, resourceKey) {
        return `${orgId ?? 'global'}:${userId ?? 'anon'}:${resourceKey}`;
    }

    /** @returns {number} Current number of cached entries */
    get size() {
        return this._store.size;
    }
}

// Singleton so all services share the same in-process store
const cacheManager = new CacheManager();
export default cacheManager;
