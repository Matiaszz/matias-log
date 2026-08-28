"use client";

import React, { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: (SelectOption | string)[];
  error?: string;
  hint?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      hint,
      placeholder = "Selecione uma opção...",
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium uppercase tracking-wider text-zinc-300"
          >
            {label} {props.required && <span className="text-red-400">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            className={`w-full appearance-none bg-zinc-950/80 border ${
              error
                ? "border-red-500/80 focus:border-red-400 focus:ring-red-400/20"
                : "border-zinc-800 focus:border-zinc-500 focus:ring-zinc-500/20"
            } rounded-xl px-3.5 py-2.5 pr-10 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 disabled:bg-zinc-900 cursor-pointer ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-zinc-900 text-zinc-500">
                {placeholder}
              </option>
            )}
            {options.map((opt) => {
              const value = typeof opt === "string" ? opt : opt.value;
              const text = typeof opt === "string" ? opt : opt.label;
              return (
                <option key={value} value={value} className="bg-zinc-900 text-zinc-100 py-1">
                  {text}
                </option>
              );
            })}
          </select>
          <div className="absolute right-3.5 flex items-center pointer-events-none text-zinc-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
