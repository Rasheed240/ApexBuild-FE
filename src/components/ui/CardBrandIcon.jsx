import { CreditCard } from 'lucide-react';

/**
 * Card Brand Icon Component
 * Displays credit card brand logos with gradient backgrounds
 */
export const CardBrandIcon = ({ brand, className = '' }) => {
    const getBrandStyle = (brand) => {
        switch (brand?.toLowerCase()) {
            case 'visa':
                return {
                    gradient: 'bg-gradient-to-br from-blue-900 to-blue-700',
                    text: 'text-white',
                    label: 'Visa',
                };
            case 'mastercard':
                return {
                    gradient: 'bg-gradient-to-br from-red-600 to-orange-500',
                    text: 'text-white',
                    label: 'Mastercard',
                };
            case 'amex':
            case 'american_express':
                return {
                    gradient: 'bg-gradient-to-br from-blue-600 to-cyan-500',
                    text: 'text-white',
                    label: 'Amex',
                };
            case 'discover':
                return {
                    gradient: 'bg-gradient-to-br from-orange-600 to-orange-400',
                    text: 'text-white',
                    label: 'Discover',
                };
            case 'diners':
            case 'diners_club':
                return {
                    gradient: 'bg-gradient-to-br from-gray-700 to-gray-500',
                    text: 'text-white',
                    label: 'Diners',
                };
            case 'jcb':
                return {
                    gradient: 'bg-gradient-to-br from-blue-700 to-green-600',
                    text: 'text-white',
                    label: 'JCB',
                };
            case 'unionpay':
                return {
                    gradient: 'bg-gradient-to-br from-red-700 to-blue-700',
                    text: 'text-white',
                    label: 'UnionPay',
                };
            default:
                return {
                    gradient: 'bg-gradient-to-br from-gray-600 to-gray-800',
                    text: 'text-white',
                    label: 'Card',
                };
        }
    };

    const style = getBrandStyle(brand);

    return (
        <div
            className={`inline-flex items-center justify-center w-12 h-8 rounded ${style.gradient} ${className}`}
            title={style.label}
        >
            <CreditCard className={`w-5 h-5 ${style.text}`} />
        </div>
    );
};

/**
 * Card Brand Text Component
 * Displays brand name with proper capitalization
 */
export const CardBrandText = ({ brand }) => {
    const getBrandName = (brand) => {
        switch (brand?.toLowerCase()) {
            case 'visa':
                return 'Visa';
            case 'mastercard':
                return 'Mastercard';
            case 'amex':
            case 'american_express':
                return 'American Express';
            case 'discover':
                return 'Discover';
            case 'diners':
            case 'diners_club':
                return 'Diners Club';
            case 'jcb':
                return 'JCB';
            case 'unionpay':
                return 'UnionPay';
            default:
                return 'Card';
        }
    };

    return <span>{getBrandName(brand)}</span>;
};
