import { api } from './api';

const BASE_URL = '/api/search';

/**
 * Global search service for searching across projects, tasks, users, etc.
 * Can be extended to search across all entities in the organization
 */
export const searchService = {
  /**
   * Global search across all entities
   * @param {string} query - Search query
   * @param {string} organizationId - Organization ID to limit search scope
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} Search results
   */
  async globalSearch(query, organizationId, filters = {}) {
    try {
      const params = new URLSearchParams({
        query,
        organizationId,
        ...filters,
      });
      const { data } = await api.get(`${BASE_URL}/global?${params}`);
      return data;
    } catch (error) {
      console.error('Global search failed:', error);
      throw error;
    }
  },

  /**
   * Search projects by name or code
   * @param {string} query - Search query
   * @param {string} organizationId - Organization ID
   * @returns {Promise<Array>} Project results
   */
  async searchProjects(query, organizationId) {
    try {
      const params = new URLSearchParams({
        query,
        organizationId,
      });
      const { data } = await api.get(`${BASE_URL}/projects?${params}`);
      return data;
    } catch (error) {
      console.error('Project search failed:', error);
      throw error;
    }
  },

  /**
   * Search tasks by title or description
   * @param {string} query - Search query
   * @param {string} organizationId - Organization ID
   * @param {Object} filters - Additional filters (projectId, departmentId, status, etc.)
   * @returns {Promise<Array>} Task results
   */
  async searchTasks(query, organizationId, filters = {}) {
    try {
      const params = new URLSearchParams({
        query,
        organizationId,
        ...filters,
      });
      const { data } = await api.get(`${BASE_URL}/tasks?${params}`);
      return data;
    } catch (error) {
      console.error('Task search failed:', error);
      throw error;
    }
  },

  /**
   * Search users by name or email
   * @param {string} query - Search query
   * @param {string} organizationId - Organization ID to limit search to org members
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} User results
   */
  async searchUsers(query, organizationId, filters = {}) {
    try {
      const params = new URLSearchParams({
        query,
        organizationId,
        ...filters,
      });
      const { data } = await api.get(`${BASE_URL}/users?${params}`);
      return data;
    } catch (error) {
      console.error('User search failed:', error);
      throw error;
    }
  },

  /**
   * Search departments by name
   * @param {string} query - Search query
   * @param {string} organizationId - Organization ID
   * @returns {Promise<Array>} Department results
   */
  async searchDepartments(query, organizationId) {
    try {
      const params = new URLSearchParams({
        query,
        organizationId,
      });
      const { data } = await api.get(`${BASE_URL}/departments?${params}`);
      return data;
    } catch (error) {
      console.error('Department search failed:', error);
      throw error;
    }
  },

  /**
   * Get search suggestions/autocomplete
   * @param {string} query - Partial query for suggestions
   * @param {string} organizationId - Organization ID
   * @param {string} type - Type to filter suggestions (projects, tasks, users, etc.)
   * @returns {Promise<Array>} Suggested results
   */
  async getSuggestions(query, organizationId, type = '') {
    try {
      const params = new URLSearchParams({
        query,
        organizationId,
      });
      if (type) params.append('type', type);

      const { data } = await api.get(`${BASE_URL}/suggestions?${params}`);
      return data;
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      throw error;
    }
  },

  /**
   * Search recent items viewed by current user
   * @param {string} organizationId - Organization ID
   * @param {number} limit - Number of recent items to return
   * @returns {Promise<Array>} Recent items
   */
  async getRecentItems(organizationId, limit = 10) {
    try {
      const params = new URLSearchParams({
        organizationId,
        limit,
      });
      const { data } = await api.get(`${BASE_URL}/recent?${params}`);
      return data;
    } catch (error) {
      console.error('Failed to get recent items:', error);
      throw error;
    }
  },

  /**
   * Search tasks assigned to current user
   * @param {string} query - Search query
   * @param {string} organizationId - Organization ID
   * @returns {Promise<Array>} Task results
   */
  async searchMyTasks(query, organizationId) {
    try {
      const params = new URLSearchParams({
        query,
        organizationId,
      });
      const { data } = await api.get(`${BASE_URL}/my-tasks?${params}`);
      return data;
    } catch (error) {
      console.error('Failed to search my tasks:', error);
      throw error;
    }
  },

  /**
   * Advanced search with multiple filters
   * @param {Object} filters - Search filters
   *   - query: string
   *   - organizationId: string
   *   - projectId: string (optional)
   *   - departmentId: string (optional)
   *   - status: string (optional)
   *   - priority: number (optional)
   *   - assignedTo: string (optional)
   *   - dateFrom: string (optional)
   *   - dateTo: string (optional)
   * @returns {Promise<Object>} Advanced search results
   */
  async advancedSearch(filters) {
    try {
      const params = new URLSearchParams(filters);
      const { data } = await api.get(`${BASE_URL}/advanced?${params}`);
      return data;
    } catch (error) {
      console.error('Advanced search failed:', error);
      throw error;
    }
  },
};

export default searchService;
