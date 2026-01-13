import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCategories,
  fetchMeasurementFields,
  createCategory,
  createMeasurementField,
  updateCategory,
  updateMeasurementField,
  deleteCategory,
  deleteMeasurementField,
  Category,
  MeasurementField,
} from "../../api/categories";
import { FormField } from "../../components/forms/FormField";
import { Input } from "../../components/forms/Input";
import { BackButton } from "../../components/ui/BackButton";
import toast from "react-hot-toast";

const AdminCategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Category state
  // ... (keeping existing state)
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  
  // Measurement field state
  const [isAddingField, setIsAddingField] = useState(false);
  const [editingField, setEditingField] = useState<MeasurementField | null>(null);
  const [fieldName, setFieldName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [unit, setUnit] = useState("inches");

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: measurementFields = [], isLoading: fieldsLoading } = useQuery({
    queryKey: ["measurement-fields"],
    queryFn: fetchMeasurementFields,
  });

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("Category added successfully");
      setIsAddingCategory(false);
      setCategoryName("");
      setCategoryDescription("");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => {
      toast.error("Failed to add category");
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateCategory(id, data),
    onSuccess: () => {
      toast.success("Category updated successfully");
      setEditingCategory(null);
      setCategoryName("");
      setCategoryDescription("");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => {
      toast.error("Failed to update category");
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => {
      toast.error("Failed to delete category");
    },
  });

  // Measurement field mutations
  const createFieldMutation = useMutation({
    mutationFn: createMeasurementField,
    onSuccess: () => {
      toast.success("Measurement field added successfully");
      setIsAddingField(false);
      setFieldName("");
      setDisplayName("");
      setUnit("inches");
      queryClient.invalidateQueries({ queryKey: ["measurement-fields"] });
    },
    onError: () => {
      toast.error("Failed to add measurement field");
    },
  });

  const updateFieldMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateMeasurementField(id, data),
    onSuccess: () => {
      toast.success("Measurement field updated successfully");
      setEditingField(null);
      setFieldName("");
      setDisplayName("");
      setUnit("inches");
      queryClient.invalidateQueries({ queryKey: ["measurement-fields"] });
    },
    onError: () => {
      toast.error("Failed to update measurement field");
    },
  });

  const deleteFieldMutation = useMutation({
    mutationFn: deleteMeasurementField,
    onSuccess: () => {
      toast.success("Measurement field deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["measurement-fields"] });
    },
    onError: () => {
      toast.error("Failed to delete measurement field");
    },
  });

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }
    createCategoryMutation.mutate({
      name: categoryName,
      description: categoryDescription || undefined,
    });
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
    setIsAddingCategory(false);
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }
    updateCategoryMutation.mutate({
      id: editingCategory.id,
      data: {
        name: categoryName,
        description: categoryDescription || undefined,
      },
    });
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
  };

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim() || !displayName.trim()) {
      toast.error("Field name and display name are required");
      return;
    }
    createFieldMutation.mutate({
      fieldName: fieldName.toLowerCase().replace(/\s+/g, "_"),
      displayName,
      unit,
    });
  };

  const handleEditField = (field: MeasurementField) => {
    setEditingField(field);
    setFieldName(field.fieldName);
    setDisplayName(field.displayName);
    setUnit(field.unit);
    setIsAddingField(false);
  };

  const handleUpdateField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingField || !fieldName.trim() || !displayName.trim()) {
      toast.error("Field name and display name are required");
      return;
    }
    updateFieldMutation.mutate({
      id: editingField.id,
      data: {
        fieldName: fieldName.toLowerCase().replace(/\s+/g, "_"),
        displayName,
        unit,
      },
    });
  };

  const handleCancelEditField = () => {
    setEditingField(null);
    setFieldName("");
    setDisplayName("");
    setUnit("inches");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories & Measurements</h1>
          <p className="text-sm text-gray-500">
            Manage dress categories and measurement fields for customer profiles.
          </p>
        </div>
      </div>

      {/* Categories Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Dress Categories</h2>
          <button
            onClick={() => setIsAddingCategory(!isAddingCategory)}
            className="rounded-full bg-black px-6 py-2 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
          >
            {isAddingCategory ? "CANCEL" : "ADD CATEGORY"}
          </button>
        </div>

        {(isAddingCategory || editingCategory) && (
          <form
            onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm space-y-4"
          >
            <h3 className="font-bold text-primary">
              {editingCategory ? `Edit Category: ${editingCategory.name}` : "Add New Category"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Category Name" name="categoryName" required>
                <Input
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g., Kaftan, Dress, Suit"
                />
              </FormField>
              <FormField label="Description" name="categoryDescription">
                <Input
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Optional description"
                />
              </FormField>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                className="flex-1 rounded-full bg-primary py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity"
              >
                {createCategoryMutation.isPending || updateCategoryMutation.isPending ? "SAVING..." : "SAVE CATEGORY"}
              </button>
              <button
                type="button"
                onClick={editingCategory ? handleCancelEditCategory : () => setIsAddingCategory(false)}
                className="rounded-full bg-gray-200 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-300 transition-colors"
              >
                CANCEL
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoriesLoading ? (
            <div className="col-span-full text-center py-8 text-gray-400">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-400">
              No categories yet. Add one to get started.
            </div>
          ) : (
            categories.map((category: Category) => (
              <div
                key={category.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{category.name}</h3>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-primary hover:text-primary/80 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete category "${category.name}"?`)) {
                          deleteCategoryMutation.mutate(category.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {category.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">{category.description}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Measurement Fields Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Measurement Fields</h2>
          <button
            onClick={() => setIsAddingField(!isAddingField)}
            className="rounded-full bg-black px-6 py-2 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
          >
            {isAddingField ? "CANCEL" : "ADD FIELD"}
          </button>
        </div>

        {(isAddingField || editingField) && (
          <form
            onSubmit={editingField ? handleUpdateField : handleAddField}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm space-y-4"
          >
            <h3 className="font-bold text-primary">
              {editingField ? `Edit Field: ${editingField.displayName}` : "Add New Measurement Field"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Field Name (Internal)" name="fieldName" required>
                <Input
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  placeholder="e.g., chest, waist, sleeve"
                  disabled={!!editingField} // Don't allow changing internal ID after creation
                />
              </FormField>
              <FormField label="Display Name" name="displayName" required>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., Chest, Waist, Sleeve"
                />
              </FormField>
              <FormField label="Unit" name="unit">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="inches">Inches</option>
                  <option value="cm">Centimeters</option>
                  <option value="meters">Meters</option>
                </select>
              </FormField>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createFieldMutation.isPending || updateFieldMutation.isPending}
                className="flex-1 rounded-full bg-primary py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity"
              >
                {createFieldMutation.isPending || updateFieldMutation.isPending ? "SAVING..." : "SAVE FIELD"}
              </button>
              <button
                type="button"
                onClick={editingField ? handleCancelEditField : () => setIsAddingField(false)}
                className="rounded-full bg-gray-200 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-300 transition-colors"
              >
                CANCEL
              </button>
            </div>
          </form>
        )}

        {/* Desktop Table */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-4">Field Name</th>
                <th className="px-6 py-4">Display Name</th>
                <th className="px-6 py-4">Unit</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fieldsLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    Loading measurement fields...
                  </td>
                </tr>
              ) : measurementFields.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    No measurement fields yet. Add one to get started.
                  </td>
                </tr>
              ) : (
                measurementFields.map((field: MeasurementField) => (
                  <tr key={field.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      {field.fieldName}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {field.displayName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{field.unit}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleEditField(field)}
                          className="text-primary hover:text-primary/80 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete field "${field.displayName}"?`)) {
                              deleteFieldMutation.mutate(field.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {fieldsLoading && <div className="p-8 text-center text-gray-400">Loading measurement fields...</div>}
          {measurementFields.map((field: MeasurementField) => (
            <div key={field.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{field.displayName}</h3>
                  <p className="text-xs font-mono text-gray-400">{field.fieldName}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditField(field)}
                    className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete field "${field.displayName}"?`)) {
                        deleteFieldMutation.mutate(field.id);
                      }
                    }}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-50 uppercase text-[10px] font-bold text-gray-400 tracking-wider">
                Unit: <span className="text-gray-900">{field.unit}</span>
              </div>
            </div>
          ))}
          {measurementFields.length === 0 && !fieldsLoading && <div className="p-8 text-center text-gray-400">No measurement fields found.</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
