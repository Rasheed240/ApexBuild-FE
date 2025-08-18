import api from './api';

const unwrap = (response) => response.data?.data ?? response.data;

/**
 * Stripe Service - Handles all Stripe-related API calls
 * Includes Checkout, Setup Intents, and Payment Method management
 */
export const stripeService = {
    /**
     * Create a Stripe Checkout session for subscription creation
     * @param {Object} params - Checkout parameters
     * @param {string} params.organizationId - Organization ID
     * @param {number} params.numberOfLicenses - Number of licenses
     * @param {number} params.trialDays - Trial period in days
     * @param {string} params.successUrl - Return URL on success
     * @param {string} params.cancelUrl - Return URL on cancel
     * @returns {Promise<{sessionId: string, url: string}>}
     */
    createCheckoutSession: async (params) => {
        const response = await api.post('/stripe/create-checkout-session', params);
        return unwrap(response);
    },

    /**
     * Create a Stripe Setup Intent session for adding payment methods
     * @param {string} customerId - Stripe customer ID
     * @param {string} successUrl - Return URL on success
     * @param {string} cancelUrl - Return URL on cancel
     * @returns {Promise<{sessionId: string, url: string}>}
     */
    createSetupSession: async (customerId, successUrl, cancelUrl) => {
        const response = await api.post('/stripe/create-setup-session', {
            customerId,
            successUrl,
            cancelUrl,
        });
        return unwrap(response);
    },

    /**
     * Get all payment methods for the current organization
     * @param {string} organizationId - Organization ID
     * @returns {Promise<Array<PaymentMethod>>}
     */
    getPaymentMethods: async (organizationId) => {
        const response = await api.get(`/stripe/payment-methods/${organizationId}`);
        return unwrap(response);
    },

    /**
     * Set a payment method as default
     * @param {string} paymentMethodId - Payment method ID
     * @returns {Promise<{success: boolean}>}
     */
    setDefaultPaymentMethod: async (paymentMethodId) => {
        const response = await api.post(`/stripe/payment-methods/${paymentMethodId}/set-default`);
        return unwrap(response);
    },

    /**
     * Delete a payment method
     * @param {string} paymentMethodId - Payment method ID
     * @returns {Promise<{success: boolean}>}
     */
    deletePaymentMethod: async (paymentMethodId) => {
        const response = await api.delete(`/stripe/payment-methods/${paymentMethodId}`);
        return unwrap(response);
    },

    /**
     * Get Stripe publishable key for client-side initialization
     * @returns {Promise<{publishableKey: string}>}
     */
    getPublishableKey: async () => {
        const response = await api.get('/stripe/publishable-key');
        return unwrap(response);
    },

    /**
     * Verify payment method setup completion
     * @param {string} sessionId - Stripe session ID
     * @returns {Promise<{success: boolean, paymentMethodId: string}>}
     */
    verifySetupSession: async (sessionId) => {
        const response = await api.get(`/stripe/verify-setup/${sessionId}`);
        return unwrap(response);
    },

    /**
     * Verify checkout session completion
     * @param {string} sessionId - Stripe session ID
     * @returns {Promise<{success: boolean, subscriptionId: string}>}
     */
    verifyCheckoutSession: async (sessionId) => {
        const response = await api.get(`/stripe/verify-checkout/${sessionId}`);
        return unwrap(response);
    },
};
