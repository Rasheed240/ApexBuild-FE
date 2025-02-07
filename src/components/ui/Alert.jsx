import { cn } from '../../utils/cn';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { useState } from 'react';

const alertVariants = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-600',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: XCircle,
    iconColor: 'text-red-600',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: AlertCircle,
    iconColor: 'text-yellow-600',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: Info,
    iconColor: 'text-blue-600',
  },
};

export const Alert = ({ variant = 'info', title, children, onClose, className }) => {
  const [isVisible, setIsVisible] = useState(true);
  const config = alertVariants[variant];
  const Icon = config.icon;

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'border rounded-lg p-4',
        config.bg,
        config.border,
        className
      )}
    >
      <div className="flex items-start">
        <Icon className={cn('h-5 w-5 mt-0.5 mr-3 flex-shrink-0', config.iconColor)} />
        <div className="flex-1">
          {title && (
            <h4 className={cn('font-semibold mb-1', config.text)}>{title}</h4>
          )}
          <div className={cn('text-sm', config.text)}>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={handleClose}
            className={cn('ml-4 flex-shrink-0 hover:opacity-75 transition-opacity', config.text)}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

