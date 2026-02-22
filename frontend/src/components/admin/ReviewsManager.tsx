import React from "react";
import { Plus, Trash2, Star } from "lucide-react";
import { Input } from "../forms/Input";
import { Textarea } from "../forms/Textarea";
import { Label } from "../forms/Label";

interface Review {
  name: string;
  rating: number;
  text: string;
  role?: string;
}

interface ReviewsManagerProps {
  reviews: Review[];
  onChange: (reviews: Review[]) => void;
}

export const ReviewsManager: React.FC<ReviewsManagerProps> = ({ reviews, onChange }) => {
  const addReview = () => {
    onChange([...reviews, { name: "", rating: 5, text: "", role: "Customer" }]);
  };

  const removeReview = (index: number) => {
    const newReviews = [...reviews];
    newReviews.splice(index, 1);
    onChange(newReviews);
  };

  const updateReview = (index: number, field: keyof Review, value: any) => {
    const newReviews = [...reviews];
    newReviews[index] = { ...newReviews[index], [field]: value };
    onChange(newReviews);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Customer Reviews</Label>
        <button
          type="button"
          onClick={addReview}
          className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80"
        >
          <Plus className="h-3 w-3" /> Add Review
        </button>
      </div>

      <div className="space-y-4">
        {reviews.map((review, index) => (
          <div key={index} className="rounded-lg border border-border bg-card/50 p-4 relative group">
            <button
               type="button"
               onClick={() => removeReview(index)}
               className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Trash2 className="h-4 w-4" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Name</label>
                <Input
                  value={review.name}
                  onChange={(e) => updateReview(index, "name", e.target.value)}
                  placeholder="Customer Name"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold uppercase text-muted-foreground">Rating (1-5)</label>
                 <Input
                  type="number"
                  min="1"
                  max="5"
                  value={review.rating}
                  onChange={(e) => updateReview(index, "rating", parseInt(e.target.value) || 5)}
                  className="h-8 text-sm"
                 />
              </div>
              <div className="space-y-1 md:col-span-2">
                 <label className="text-[10px] font-bold uppercase text-muted-foreground">Review Text</label>
                 <Textarea
                  value={review.text}
                  onChange={(e) => updateReview(index, "text", e.target.value)}
                  placeholder="What did they say?"
                  rows={2}
                  className="text-sm"
                 />
              </div>
            </div>
          </div>
        ))}
        
        {reviews.length === 0 && (
            <div className="text-center py-8 border border-dashed border-border rounded-lg text-muted-foreground text-sm">
                No reviews added yet. Add some social proof!
            </div>
        )}
      </div>
    </div>
  );
};
