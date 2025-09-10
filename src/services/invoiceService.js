import api from './api';

const unwrap = (response) => response.data?.data ?? response.data;

/**
 * Invoice Service - Handles all invoice and billing history operations
 */
export const invoiceService = {
    /**
     * Get all invoices for an organization
     * @param {string} organizationId - Organization ID
     * @param {Object} filters - Filter options
     * @param {string} filters.status - Invoice status filter
     * @param {string} filters.startDate - Start date for range
     * @param {string} filters.endDate - End date for range
     * @param {number} filters.page - Page number
     * @param {number} filters.limit - Items per page
     * @returns {Promise<{invoices: Array, total: number, pages: number}>}
     */
    getInvoices: async (organizationId, filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const response = await api.get(
            `/invoices/organization/${organizationId}?${params.toString()}`
        );
        return unwrap(response);
    },

    /**
     * Get a single invoice by ID
     * @param {string} invoiceId - Invoice ID
     * @returns {Promise<Object>} Invoice details
     */
    getInvoiceById: async (invoiceId) => {
        const response = await api.get(`/invoices/${invoiceId}`);
        return unwrap(response);
    },

    /**
     * Download invoice as PDF
     * @param {string} invoiceId - Invoice ID
     * @returns {Promise<Blob>} PDF blob
     */
    downloadInvoice: async (invoiceId) => {
        const response = await api.get(`/invoices/${invoiceId}/download`, {
            responseType: 'blob',
        });
        return response.data;
    },

    /**
     * Get upcoming invoice preview
     * @param {string} subscriptionId - Subscription ID
     * @returns {Promise<Object>} Upcoming invoice details
     */
    getUpcomingInvoice: async (subscriptionId) => {
        const response = await api.get(`/invoices/upcoming/${subscriptionId}`);
        return unwrap(response);
    },

    /**
     * Preview proration for subscription change
     * @param {string} subscriptionId - Subscription ID
     * @param {number} newQuantity - New license quantity
     * @returns {Promise<Object>} Proration preview with amounts
     */
    previewProration: async (subscriptionId, newQuantity) => {
        const response = await api.get(
            `/subscriptions/${subscriptionId}/preview-proration?newQuantity=${newQuantity}`
        );
        return unwrap(response);
    },

    /**
     * Get billing summary/totals for organization
     * @param {string} organizationId - Organization ID
     * @param {string} startDate - Start date
     * @param {string} endDate - End date
     * @returns {Promise<Object>} Billing summary
     */
    getBillingSummary: async (organizationId, startDate, endDate) => {
        const params = new URLSearchParams({ startDate, endDate });
        const response = await api.get(
            `/invoices/organization/${organizationId}/summary?${params.toString()}`
        );
        return unwrap(response);
    },
};
