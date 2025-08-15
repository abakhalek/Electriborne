import React, { ReactNode } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md'
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={onClose}
          aria-hidden="true"
        ></div>

        {/* Modal */}
        <div className={`inline-block overflow-hidden text-left align-bottom transition-all transform bg-bleu rounded-lg shadow-xl sm:my-8 sm:align-middle sm:w-full ${sizeClasses[size]}`}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormModal;