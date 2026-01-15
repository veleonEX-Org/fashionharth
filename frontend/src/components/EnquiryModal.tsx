import React, { useState } from "react";
import Modal from "./Modal";
import { useAuth } from "../state/AuthContext";
import { http } from "../api/http";
import toast from "react-hot-toast";
import { Input } from "./forms/Input";
import { Label } from "./forms/Label";
import { Textarea } from "./forms/Textarea";
import { useNavigate } from "react-router-dom";

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
  item?: { id: number; name: string };
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMessage = "",
  item 
}) => {
  const [message, setMessage] = useState(initialMessage);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setLoading(true);
    try {
      const content = item 
        ? `Enquiry about ${item.name} (Item ID: ${item.id}):\n\n${message}`
        : message;

      await http.post("/chat/conversations", {
        isSupport: true,
        message: content,
      });
      
      toast.success("Enquiry sent! Redirecting to chat...");
      onClose();
      setMessage("");
      
      // Delay slightly to let the user see the toast
      setTimeout(() => {
        navigate("/chat");
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send enquiry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Enquiry${item ? ` for ${item.name}` : ""}`}>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div className="space-y-1">
          <Label htmlFor="message">Your Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we help you?"
            required
            rows={5}
            className="resize-none"
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Enquiry"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
