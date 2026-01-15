import React from "react";
import { Label } from "./Label";

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
    <div className="space-y-1">
      <Label htmlFor={name}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};
