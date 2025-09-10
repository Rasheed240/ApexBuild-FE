import { useState, useEffect } from 'react';
import { invoiceService } from '../../services/invoiceService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import {
    FileText,
    Download,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Clock,
    RefreshCcw,
    Calendar,
    DollarSign,
    Eye,
} from 'lucide-react';

/**
 * Billing History Tab Component
 * Comprehensive invoice history with filters, search, and downloads
 */
export const BillingHistoryTab = ({ organizationId }) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        startDate: '',
        endDate: '',
        search: '',
        page: 1,
        limit: 20,
    });
    const [pagination, setPagination] = useState({ total: 0, pages: 0 });
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        if (organizationId) {
            loadInvoices();
            loadSummary();
        }
    }, [organizationId, filters.status, filters.startDate, filters.endDate, filters.page]);

    const loadInvoices = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await invoiceService.getInvoices(organizationId, filters);
            setInvoices(result.invoices || []);
            setPagination({
                total: result.total || 0,
                pages: result.pages || 0,
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    const loadSummary = async () => {
        if (!filters.startDate || !filters.endDate) return;

        try {
            const summaryData = await invoiceService.getBillingSummary(
                organizationId,
                filters.startDate,
                filters.endDate
            );
            setSummary(summaryData);
        } catch (err) {
            // Silent fail for summary
        }
    };

    const handleDownload = async (invoiceId) => {
        setDownloadingId(invoiceId);

        try {
            const blob = await invoiceService.downloadInvoice(invoiceId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${invoiceId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError('Failed to download invoice');
        } finally {
            setDownloadingId(null);
        }
    };

    const handleViewDetails = async (invoice) => {
        try {
            const details = await invoiceService.getInvoiceById(invoice.id);
            setSelectedInvoice(details);
            setShowDetailModal(true);
        } catch (err) {
            setError('Failed to load invoice details');
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return <CheckCircle2 className="w-4 h-4 text-green-600" />;
            case 'failed':
            case 'void':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'pending':
            case 'draft':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'refunded':
                return <RefreshCcw className="w-4 h-4 text-blue-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'failed':
            case 'void':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'pending':
            case 'draft':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'refunded':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    // Filter invoices by search term
    const filteredInvoices = invoices.filter((invoice) => {
        if (!filters.search) return true;
        const searchLower = filters.search.toLowerCase();
        return (
            invoice.id?.toLowerCase().includes(searchLower) ||
            invoice.number?.toLowerCase().includes(searchLower) ||
            invoice.description?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <>
            <div className="space-y-6">
                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <DollarSign className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Paid</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {formatAmount(summary.totalPaid)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <FileText className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Invoices</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {summary.count}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <Calendar className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Invoice</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {formatAmount(summary.average)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Filters Card */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    Billing History
                                </CardTitle>
                                <CardDescription>
                                    {pagination.total} invoice{pagination.total !== 1 ? 's' : ''} total
                                </CardDescription>
                            </div>
                            <Button onClick={loadInvoices} variant="outline" size="sm">
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Filters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search invoices..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    className="pl-10"
                                />
                            </div>

                            {/* Status Filter */}
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">All Statuses</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </select>

                            {/* Date Range */}
                            <Input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
                                placeholder="Start date"
                            />
                            <Input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
                                placeholder="End date"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Loading */}
                        {loading ? (
                            <LoadingSpinner size="lg" text="Loading invoices..." className="py-12" />
                        ) : filteredInvoices.length === 0 ? (
                            <EmptyState
                                icon={FileText}
                                title="No invoices found"
                                description={
                                    filters.search || filters.status
                                        ? 'Try adjusting your filters'
                                        : 'Invoice history will appear here once you have charges'
                                }
                            />
                        ) : (
                            <>
                                {/* Invoice Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b border-gray-200 dark:border-gray-700">
                                            <tr>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                                    Invoice
                                                </th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                                    Date
                                                </th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                                    Description
                                                </th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                                    Amount
                                                </th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                                    Status
                                                </th>
                                                <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredInvoices.map((invoice) => (
                                                <tr
                                                    key={invoice.id}
                                                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                >
                                                    <td className="py-3 px-4">
                                                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                                                            {invoice.number || invoice.id.slice(-8).toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {formatDate(invoice.createdAt || invoice.date)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-sm text-gray-900 dark:text-white">
                                                            {invoice.description || 'Subscription renewal'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {formatAmount(invoice.amount)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                                invoice.status
                                                            )}`}
                                                        >
                                                            {getStatusIcon(invoice.status)}
                                                            {invoice.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleViewDetails(invoice)}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDownload(invoice.id)}
                                                                disabled={downloadingId === invoice.id}
                                                            >
                                                                {downloadingId === invoice.id ? (
                                                                    <RefreshCcw className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <Download className="w-4 h-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Page {filters.page} of {pagination.pages}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                                disabled={filters.page === 1}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                                disabled={filters.page >= pagination.pages}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Invoice Detail Modal */}
            <InvoiceDetailModal
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedInvoice(null);
                }}
                invoice={selectedInvoice}
                onDownload={handleDownload}
            />
        </>
    );
};
