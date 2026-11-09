import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({ open, onClose, title, children, className }) => {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [open]);

  // Handle ESC key or backdrop click
  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className={cn(
        'backdrop:bg-black/50 backdrop:backdrop-blur-[2px] bg-panel text-ink border border-line rounded-[18px] shadow-panel p-0 max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-hidden m-auto',
        'open:animate-in open:fade-in open:zoom-in-95 duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        {title && <h2 className="font-serif font-semibold text-lg text-accent">{title}</h2>}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar modal"
          className="w-8 h-8 rounded-full inline-grid place-items-center text-muted hover:text-ink hover:bg-chip transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-5 overflow-y-auto max-h-[calc(100vh-8rem)]">{children}</div>
    </dialog>
  );
};
