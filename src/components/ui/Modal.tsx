"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showClose?: boolean;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full m-0 h-full rounded-none",
};

function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  trigger,
  className,
  size = "md",
  showClose = true,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-earth-950/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className={cn(
                  "fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2",
                  "bg-clay-50 rounded-2xl clay-shadow-lg border border-earth-100",
                  "p-6 focus:outline-none",
                  "max-h-[90vh] overflow-y-auto",
                  sizeClasses[size],
                  className
                )}
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {(title || showClose) && (
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      {title && (
                        <Dialog.Title className="font-display text-lg font-semibold text-earth-900">
                          {title}
                        </Dialog.Title>
                      )}
                      {description && (
                        <Dialog.Description className="mt-1 text-sm text-earth-500">
                          {description}
                        </Dialog.Description>
                      )}
                    </div>
                    {showClose && (
                      <Dialog.Close className="rounded-lg p-1.5 text-earth-400 hover:bg-earth-100 hover:text-earth-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-clay-500">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                      </Dialog.Close>
                    )}
                  </div>
                )}
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export { Modal };
