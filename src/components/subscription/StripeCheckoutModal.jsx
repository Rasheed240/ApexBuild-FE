import { useState } from 'react';
import { useStripeCheckout } from '../../hooks/useStripeCheckout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Loader2, CreditCard, CheckCircle2, XCircle } from 'lucide-react';

/**
 * Stripe Checkout Modal Component
 * Handles subscription creation via Stripe Checkout
 * Users are redirected to Stripe-hosted checkout page
 */
export const StripeCheckoutModal = ({ isOpen, onClose, organizationId, initialData }) => {
    const { loading, error, createCheckout } = useStripeCheckout();
    const [formData, setFormData] = useState({
        numberOfLicenses: initialData?.numberOfLicenses || 10,
        trialDays: initialData?.trialDays || 14,
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const success = await createCheckout({
            organizationId,
            numberOfLicenses: parseInt(formData.numberOfLicenses),
            trialDays: parseInt(formData.trialDays),
        });

        if (success) {
            // User will be redirected to Stripe Checkout
            // No need to close modal as page will redirect
        }
    };

    const calculateTotal = () => {
        const monthlyTotal = formData.numberOfLicenses * 10; // $10 per license
        return monthlyTotal.toFixed(2);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        Create Subscription
                    </CardTitle>
                    <CardDescription>
                        You'll be redirected to Stripe's secure payment page
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <Alert variant="error">{error}</Alert>}

                        {/* License Configuration */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Number of Licenses
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="1000"
                                    value={formData.numberOfLicenses}
                                    onChange={(e) =>
                                        setFormData({ ...formData, numberOfLicenses: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    disabled={loading}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    $10 per license per month
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Trial Period (Days)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="90"
                                    value={formData.trialDays}
                                    onChange={(e) =>
                                        setFormData({ ...formData, trialDays: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={loading}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.trialDays > 0
                                        ? `Free trial for ${formData.trialDays} days, then $${calculateTotal()}/month`
                                        : 'No trial period - billing starts immediately'}
                                </p>
                            </div>
                        </div>

                        {/* Pricing Summary */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Monthly Total
                                </span>
                                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    ${calculateTotal()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                                <span>{formData.numberOfLicenses} licenses × $10</span>
                                {formData.trialDays > 0 && (
                                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                                        {formData.trialDays} days free
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* What Happens Next */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                What happens next?
                            </h4>
                            <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 dark:text-blue-400">1.</span>
                                    Redirect to secure Stripe payment page
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 dark:text-blue-400">2.</span>
                                    Enter payment details (card, Apple Pay, Google Pay)
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 dark:text-blue-400">3.</span>
                                    Subscription activated instantly
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 dark:text-blue-400">4.</span>
                                    Return to subscription dashboard
                                </li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Redirecting to Stripe...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Continue to Payment
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
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                        </div>

                        {/* Security Badge */}
                        <div className="text-center pt-2 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Secured by Stripe • PCI DSS Level 1 Compliant
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
