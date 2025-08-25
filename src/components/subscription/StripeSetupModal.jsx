import { useState } from 'react';
import { useStripeCheckout } from '../../hooks/useStripeCheckout';
import { Card, CardContent, Card Header, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Loader2, CreditCard, Lock } from 'lucide-react';

/**
 * Stripe Setup Modal Component
 * Handles adding payment methods via Stripe Setup
 * Users are redirected to Stripe-hosted setup page
 */
export const StripeSetupModal = ({ isOpen, onClose, customerId }) => {
    const { loading, error, createSetup } = useStripeCheckout();

    if (!isOpen) return null;

    const handleAddPaymentMethod = async () => {
        if (!customerId) {
            return;
        }

        const success = await createSetup(customerId);

        if (success) {
            // User will be redirected to Stripe Setup
            // No need to close modal as page will redirect
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        Add Payment Method
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="space-y-4">
                        {error && <Alert variant="error">{error}</Alert>}

                        {/* Information */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start gap-3">
                                <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                                        Secure Payment Setup
                                    </p>
                                    <ul className="text-xs text-blue-700 dark:text-blue-200 space-y-1">
                                        <li>• Your payment info is encrypted and stored securely by Stripe</li>
                                        <li>• We never see or store your full card details</li>
                                        <li>• You can remove this payment method anytime</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Supported Payment Methods */}
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Supported Payment Methods
                            </p>
                            <div className="grid grid-cols-4 gap-2">
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-2 flex items-center justify-center">
                                    <span className="text-xs font-semibold text-blue-900">VISA</span>
                                </div>
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-2 flex items-center justify-center">
                                    <span className="text-xs font-semibold text-orange-600">MC</span>
                                </div>
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-2 flex items-center justify-center">
                                    <span className="text-xs font-semibold text-blue-600">AMEX</span>
                                </div>
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-2 flex items-center justify-center">
                                    <span className="text-xs font-semibold text-gray-600">Pay</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                onClick={handleAddPaymentMethod}
                                disabled={loading || !customerId}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Redirecting...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Continue to Stripe
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>

                        {/* Security Footer */}
                        <div className="text-center pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Powered by Stripe • Industry-leading security
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
