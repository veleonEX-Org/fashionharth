import React from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  className = "",
  error,
  ...props
}) => {
  return (
    <textarea
      className={`w-full rounded-md border ${
        error ? "border-red-500" : "border-border"
      } bg-black/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary resize-none ${
        props.disabled ? "cursor-not-allowed opacity-60" : ""
      } ${className}`}
      {...props}
    />
  );
};




