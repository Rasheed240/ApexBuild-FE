/**
 * Empty State Component
 * Displays when there's no data to show
 */
export const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    className = '',
}) => {
    return (
        <div className={`text-center py-12 ${className}`}>
            {Icon && <Icon className="w-12 h-12 text-gray-400 mx-auto mb-3" />}
            {title && (
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {title}
                </h3>
            )}
            {description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
            )}
            {action}
        </div>
    );
};
