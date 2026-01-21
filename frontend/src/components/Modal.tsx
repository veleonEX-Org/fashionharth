import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-2xl transition-all animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-4 px-5">
          <h2 className="text-lg font-black tracking-tight text-foreground uppercase">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close modal"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          )}
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">
          <div className="text-sm text-foreground">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
