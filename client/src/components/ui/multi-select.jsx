"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function MultiSelect({
  options = [],
  selectedValues = [],
  onChange,
  placeholder = "Select options",
  className,
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (option) => {
    let updated;
    if (selectedValues.includes(option)) {
      updated = selectedValues.filter((v) => v !== option);
    } else {
      updated = [...selectedValues, option];
    }
    onChange(updated);
  };

  const handleRemove = (option, e) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== option));
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-xs outline-none transition-[color,box-shadow]",
          "focus:border-ring focus:ring-ring/50 focus:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-input/30 dark:border-input dark:text-foreground text-foreground",
          "cursor-pointer"
        )}
      >
        <div className="flex flex-wrap gap-1.5 items-center text-left">
          {selectedValues.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            selectedValues.map((val) => (
              <span
                key={val}
                className="inline-flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-xs px-2 py-0.5 rounded-full border border-slate-200 dark:border-zinc-700 font-medium"
              >
                {val}
                <span
                  onClick={(e) => handleRemove(val, e)}
                  className="hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-full p-0.5 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </span>
              </span>
            ))
          )}
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 opacity-50 transition-transform duration-200", isOpen && "transform rotate-180")} />
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md outline-none dark:bg-zinc-900 dark:border-zinc-800 animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="p-1 space-y-0.5">
            {options.map((option) => {
              const isSelected = selectedValues.includes(option);
              return (
                <div
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                    "hover:bg-accent hover:text-accent-foreground dark:hover:bg-zinc-800",
                    isSelected && "bg-slate-50 dark:bg-zinc-800/50"
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleSelect(option)}
                    onClick={(e) => e.stopPropagation()} // Prevent double triggers
                  />
                  <span className="flex-1 cursor-pointer select-none text-left">
                    {option}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
