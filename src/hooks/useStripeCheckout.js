import { useState, useCallback } from 'react';
import { stripeService } from '../services/stripeService';

/**
 * Custom hook for managing Stripe Checkout flow
 * Handles session creation, redirect, and verification
 */
export const useStripeCheckout = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Initiate Stripe Checkout for subscription creation
     * @param {Object} params - Checkout parameters
     * @returns {Promise<boolean>} Success status
     */
    const createCheckout = useCallback(async (params) => {
        setLoading(true);
        setError(null);

        try {
            const { url } = await stripeService.createCheckoutSession({
                ...params,
                successUrl: `${window.location.origin}/subscriptions/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: `${window.location.origin}/subscriptions?checkout=cancelled`,
            });

            // Redirect to Stripe Checkout
            window.location.href = url;
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create checkout session');
            setLoading(false);
            return false;
        }
    }, []);

    /**
     * Initiate Stripe Setup for adding payment method
     * @param {string} customerId - Stripe customer ID
     * @returns {Promise<boolean>} Success status
     */
    const createSetup = useCallback(async (customerId) => {
        setLoading(true);
        setError(null);

        try {
            const { url } = await stripeService.createSetupSession(
                customerId,
                `${window.location.origin}/subscriptions?setup=success`,
                `${window.location.origin}/subscriptions?setup=cancelled`
            );

            // Redirect to Stripe Setup
            window.location.href = url;
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create setup session');
            setLoading(false);
            return false;
        }
    }, []);

    /**
     * Verify checkout session after redirect
     * @param {string} sessionId - Stripe session ID from URL
     * @returns {Promise<Object|null>} Verification result
     */
    const verifyCheckout = useCallback(async (sessionId) => {
        setLoading(true);
        setError(null);

        try {
            const result = await stripeService.verifyCheckoutSession(sessionId);
            setLoading(false);
            return result;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify checkout');
            setLoading(false);
            return null;
        }
    }, []);

    /**
     * Verify setup session after redirect
     * @param {string} sessionId - Stripe session ID from URL
     * @returns {Promise<Object|null>} Verification result
     */
    const verifySetup = useCallback(async (sessionId) => {
        setLoading(true);
        setError(null);

        try {
            const result = await stripeService.verifySetupSession(sessionId);
            setLoading(false);
            return result;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify setup');
            setLoading(false);
            return null;
        }
    }, []);

    return {
        loading,
        error,
        createCheckout,
        createSetup,
        verifyCheckout,
        verifySetup,
    };
};
