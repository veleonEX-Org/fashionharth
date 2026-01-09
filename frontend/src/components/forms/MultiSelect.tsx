import React from "react";

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  value,
  onChange,
  options,
  error,
  disabled,
  placeholder = "Select options...",
}) => {
  const handleToggle = (optionValue: string) => {
    if (disabled) return;
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={`min-h-[2.5rem] w-full rounded-md border ${
          error ? "border-red-500" : "border-border"
        } bg-black/40 px-3 py-2 text-sm ${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}
      >
        {value.length === 0 ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {value.map((val) => {
              const option = options.find((opt) => opt.value === val);
              return (
                <span
                  key={val}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-1 text-xs text-primary"
                >
                  {option?.label || val}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(val);
                      }}
                      className="hover:text-red-400"
                    >
                      ×
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        )}
      </div>
      {!disabled && (
        <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border bg-black/60 p-2">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-muted/60"
            >
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={() => handleToggle(option.value)}
                className="rounded border-border"
              />
              <span className="text-sm text-gray-200">{option.label}</span>
            </label>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};




