import { cn } from '../../utils/cn';

export const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }) => {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className }) => {
  return (
    <h3 className={cn('text-xl font-semibold text-gray-900 dark:text-white', className)}>
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className }) => {
  return (
    <p className={cn('text-sm text-gray-500 dark:text-gray-400 mt-1', className)}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className }) => {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
};
