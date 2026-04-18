"use client";

import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--color-clay-50)",
            color: "var(--color-earth-900)",
            border: "1px solid var(--color-earth-200)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.875rem",
            boxShadow: "var(--shadow-clay-md)",
          },
          success: {
            iconTheme: {
              primary: "var(--color-sage-500)",
              secondary: "var(--color-clay-50)",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--color-kiln-600)",
              secondary: "var(--color-clay-50)",
            },
          },
        }}
      />
    </>
  );
}
