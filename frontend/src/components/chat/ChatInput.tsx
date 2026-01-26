import React, { useState } from "react";
import { Input } from "../forms/Input";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  buttonText?: string;
  showButtonText?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  placeholder = "Type a message...",
  buttonText = "Send",
  showButtonText = false,
}) => {
  const [inputText, setInputText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSend(inputText.trim());
      setInputText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 md:p-4 border-t border-border bg-card/50">
      <div className="flex gap-2 md:gap-3 max-w-4xl mx-auto">
        <Input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={placeholder}
          className="rounded-full px-4 md:px-5 border-input bg-background h-11 md:h-12 text-sm"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 font-medium text-sm h-11 md:h-12 flex-shrink-0 ${
            showButtonText ? "px-4 md:px-6" : "w-11 md:w-12"
          }`}
        >
          {showButtonText ? (
            <span className="hidden md:inline">{buttonText}</span>
          ) : null}
          <Send size={18} className={showButtonText ? "md:hidden" : ""} />
        </button>
      </div>
    </form>
  );
};
