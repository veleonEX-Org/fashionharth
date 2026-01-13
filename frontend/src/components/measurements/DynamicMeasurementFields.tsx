import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchMeasurementFields } from "../../api/categories";
import { FormField } from "../forms/FormField";
import { Input } from "../forms/Input";

interface MeasurementEntry {
  [fieldName: string]: string;
}

interface DynamicMeasurementFieldsProps {
  measurements: Record<string, MeasurementEntry>;
  onChange: (measurements: Record<string, MeasurementEntry>) => void;
}

export const DynamicMeasurementFields: React.FC<DynamicMeasurementFieldsProps> = ({
  measurements,
  onChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: measurementFields = [] } = useQuery({
    queryKey: ["measurement-fields"],
    queryFn: fetchMeasurementFields,
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Initialize empty measurements for this category if not exists
    if (!measurements[category]) {
      onChange({
        ...measurements,
        [category]: {},
      });
    }
  };

  const handleFieldChange = (category: string, fieldName: string, value: string) => {
    onChange({
      ...measurements,
      [category]: {
        ...(measurements[category] || {}),
        [fieldName]: value,
      },
    });
  };

  const handleRemoveCategory = (category: string) => {
    const newMeasurements = { ...measurements };
    delete newMeasurements[category];
    onChange(newMeasurements);
    if (selectedCategory === category) {
      setSelectedCategory("");
    }
  };

  const availableCategories = categories.filter(
    (cat) => !Object.keys(measurements).includes(cat.name)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Measurements
        </h3>
      </div>

      {/* Existing Categories */}
      {Object.keys(measurements).map((category) => (
        <div
          key={category}
          className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900 uppercase text-xs tracking-wider">
              {category}
            </h4>
            <button
              type="button"
              onClick={() => handleRemoveCategory(category)}
              className="text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {measurementFields.map((field) => (
              <FormField
                key={field.id}
                label={`${field.displayName} (${field.unit})`}
                name={`${category}-${field.fieldName}`}
              >
                <Input
                  type="number"
                  step="0.1"
                  value={measurements[category]?.[field.fieldName] || ""}
                  onChange={(e) =>
                    handleFieldChange(category, field.fieldName, e.target.value)
                  }
                  placeholder={`Enter ${field.displayName.toLowerCase()}`}
                />
              </FormField>
            ))}
          </div>
        </div>
      ))}

      {/* Add New Category */}
      {availableCategories.length > 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">Select a category to add...</option>
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          {selectedCategory && (
            <p className="mt-2 text-xs text-gray-500">
              Fill in the measurements for {selectedCategory} above
            </p>
          )}
        </div>
      )}

      {Object.keys(measurements).length === 0 && availableCategories.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No categories available. Please add categories first.
        </div>
      )}
    </div>
  );
};
