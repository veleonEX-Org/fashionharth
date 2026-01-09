import React from "react";

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  error,
  required,
  children,
}) => {
  return (
    <div className="space-y-1 text-sm">
      <label htmlFor={name} className="block text-gray-200">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};




