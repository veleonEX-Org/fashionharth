import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select: React.FC<SelectProps> = ({
  className = "",
  error,
  options,
  ...props
}) => {
  return (
    <select
      className={`w-full rounded-md border ${
        error ? "border-red-500" : "border-border"
      } bg-black/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary ${
        props.disabled ? "cursor-not-allowed opacity-60" : ""
      } ${className}`}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};




