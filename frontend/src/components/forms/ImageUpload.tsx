import React, { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { http } from "../../api/http";
import toast from "react-hot-toast";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  error?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  value,
  onChange,
  folder = "fashion",
  error,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (e.g., 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size should be less than 50MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);

    setIsUploading(true);
    try {
      const response = await http.post<{ imageUrl: string }>("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      onChange(response.data.imageUrl);
      toast.success("Image uploaded successfully");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      
      <div className={`mt-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition-colors ${
        error ? "border-red-500 bg-red-50" : "border-border hover:border-primary/50"
      }`}>
        {value ? (
          <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg bg-gray-100">
            <img 
              src={value} 
              alt="Uploaded preview" 
              className="h-full w-full object-contain"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center space-y-2 py-4"
          >
            <div className="rounded-full bg-primary/10 p-3">
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <Upload className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                {isUploading ? "Uploading..." : "Click to upload image"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG or WEBP up to 50MB
              </p>
            </div>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isUploading}
        />
      </div>
      
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};
