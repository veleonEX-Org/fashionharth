import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  className = "",
  error,
  ...props
}) => {
  return (
    <input
      className={`w-full rounded-md border ${
        error ? "border-red-500" : "border-border"
      } bg-black/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary ${
        props.disabled ? "cursor-not-allowed opacity-60" : ""
      } ${className}`}
      {...props}
    />
  );
};




