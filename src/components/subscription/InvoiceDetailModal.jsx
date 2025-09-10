import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Download, X, CheckCircle2, Calendar, CreditCard, RefreshCcw } from 'lucide-react';

/**
 * Invoice Detail Modal Component
 * Shows detailed breakdown of an invoice with line items
 */
export const InvoiceDetailModal = ({ isOpen, onClose, invoice, onDownload }) => {
    if (!isOpen || !invoice) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle>Invoice Details</CardTitle>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-mono">
                                    #{invoice.number || invoice.id?.slice(-8).toUpperCase()}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Invoice Header Info */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Invoice Date
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {formatDate(invoice.createdAt || invoice.date)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Status
                            </p>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                {invoice.status}
                            </span>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Description</p>
                        <p className="text-gray-900 dark:text-white">
                            {invoice.description || 'Subscription renewal'}
                        </p>
                    </div>

                    {/* Line Items */}
                    {invoice.lineItems && invoice.lineItems.length > 0 && (
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Line Items</h4>
                            <div className="space-y-2">
                                {invoice.lineItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                                    >
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {item.description}
                                            </p>
                                            {item.quantity && item.quantity > 1 && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {item.quantity} × {formatAmount(item.unitPrice)}
                                                </p>
                                            )}
                                        </div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {formatAmount(item.amount)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Proration Details */}
                    {invoice.prorationDetails && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start gap-2">
                                <RefreshCcw className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                        Prorated Charge
                                    </p>
                                    <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                                        {invoice.prorationDetails.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Totals */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
                        {invoice.subtotal && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                <span className="text-gray-900 dark:text-white">{formatAmount(invoice.subtotal)}</span>
                            </div>
                        )}
                        {invoice.tax && invoice.tax > 0 && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                                <span className="text-gray-900 dark:text-white">{formatAmount(invoice.tax)}</span>
                            </div>
                        )}
                        {invoice.discount && invoice.discount > 0 && (
                            <div className="flex justify-between items-center text-sm text-green-600 dark:text-green-400">
                                <span>Discount</span>
                                <span>-{formatAmount(invoice.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatAmount(invoice.amount || invoice.total)}
                            </span>
                        </div>
                    </div>

                    {/* Payment Method */}
                    {invoice.paymentMethod && (
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <CreditCard className="w-4 h-4" />
                            <span>
                                Charged to {invoice.paymentMethod.brand} •••• {invoice.paymentMethod.last4}
                            </span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            onClick={() => onDownload(invoice.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                        </Button>
                        <Button onClick={onClose} variant="outline" className="flex-1">
                            Close
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
