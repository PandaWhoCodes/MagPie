import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Simple SVG icons (no lucide-react needed)
const SunIcon = ({ className = "h-4 w-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = ({ className = "h-4 w-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

export function ThemeToggle({ mode, onToggle, showLabel = false, className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <SunIcon className="h-4 w-4 text-muted-foreground" />
      <Switch
        checked={mode === "dark"}
        onCheckedChange={onToggle}
        aria-label="Toggle dark mode"
      />
      <MoonIcon className="h-4 w-4 text-muted-foreground" />
      {showLabel && (
        <Label className="text-sm text-muted-foreground cursor-pointer" onClick={onToggle}>
          {mode === "dark" ? "Dark" : "Light"}
        </Label>
      )}
    </div>
  );
}

// Default export for backward compatibility
export default ThemeToggle;
