/**
 * cachedApi.js
 * ───────────────────────────────────────────────────────────────────────────
 * Thin wrapper over the central axios `api` instance that adds a transparent
 * frontend cache layer for GET requests.
 *
 * Usage (replaces direct api.get calls in services):
 *
 *   import cachedApi from './cachedApi';
 *
 *   // Cached GET (5-minute TTL)
 *   const data = await cachedApi.get('/projects', params, {
 *     cacheKey: 'projects:list',
 *     ttlMs: 5 * 60 * 1000,
 *   });
 *
 *   // Mutation — auto-invalidates by prefix
 *   const result = await cachedApi.post('/projects', body, {
 *     invalidatePrefixes: ['projects:'],
 *   });
 *
 * The cache key is automatically namespaced with org + user context so
 * two different users / orgs on the same browser session never share entries.
 */

import api from './api';
import cacheManager from './cacheManager';

// ── Helpers to read context ───────────────────────────────────────────────

function getCurrentOrgId() {
    return localStorage.getItem('selectedOrganizationId') ?? 'global';
}

function getCurrentUserId() {
    try {
        const raw = localStorage.getItem('apexbuild_user');
        if (!raw) return 'anon';
        const user = JSON.parse(raw);
        return user?.id ?? user?.userId ?? 'anon';
    } catch {
        return 'anon';
    }
}

function buildScopedKey(resourceKey) {
    return cacheManager.buildKey(getCurrentOrgId(), getCurrentUserId(), resourceKey);
}

// ── Cached GET ────────────────────────────────────────────────────────────

/**
 * @param {string} url
 * @param {object} [params] - axios params
 * @param {{ cacheKey: string, ttlMs?: number }} options
 */
async function cachedGet(url, params = {}, { cacheKey, ttlMs = 5 * 60 * 1000 } = {}) {
    if (!cacheKey) {
        // No cache key → direct pass-through
        const response = await api.get(url, { params });
        return response.data;
    }

    const scopedKey = buildScopedKey(cacheKey);
    const cached = cacheManager.get(scopedKey);
    if (cached !== null) {
        return cached;
    }

    const response = await api.get(url, { params });
    const data = response.data;
    cacheManager.set(scopedKey, data, ttlMs);
    return data;
}

// ── Mutating Methods with auto-invalidation ────────────────────────────────

/**
 * Execute a mutating request and evict related cache entries.
 *
 * @param {'post'|'put'|'patch'|'delete'} method
 * @param {string} url
 * @param {object} [body]
 * @param {{ invalidatePrefixes?: string[], invalidateKeys?: string[] }} [options]
 */
async function mutate(method, url, body, { invalidatePrefixes = [], invalidateKeys = [] } = {}) {
    let response;
    if (method === 'delete') {
        response = await api.delete(url);
    } else {
        response = await api[method](url, body);
    }

    // Invalidate: exact keys first, then prefix sweeps
    for (const key of invalidateKeys) {
        cacheManager.remove(buildScopedKey(key));
    }
    for (const prefix of invalidatePrefixes) {
        // Prefix scans run against ALL keys (not just user-scoped) because
        // an org admin's mutation should also bust other users' cached lists.
        cacheManager.clearByPrefix(prefix);
    }

    return response.data;
}

// ── Public API ────────────────────────────────────────────────────────────

const cachedApi = {
    /**
     * Cached GET – returns data (not full axios response).
     * @param {string} url
     * @param {object} [params]
     * @param {{ cacheKey: string, ttlMs?: number }} [options]
     */
    get: cachedGet,

    /**
     * POST with optional cache invalidation.
     * @param {string} url
     * @param {object} [body]
     * @param {{ invalidatePrefixes?: string[], invalidateKeys?: string[] }} [options]
     */
    post: (url, body, options) => mutate('post', url, body, options),

    /**
     * PUT with optional cache invalidation.
     */
    put: (url, body, options) => mutate('put', url, body, options),

    /**
     * PATCH with optional cache invalidation.
     */
    patch: (url, body, options) => mutate('patch', url, body, options),

    /**
     * DELETE with optional cache invalidation.
     */
    delete: (url, options) => mutate('delete', url, undefined, options),
};

export default cachedApi;
