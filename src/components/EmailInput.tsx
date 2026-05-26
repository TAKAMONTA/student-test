"use client";

import { useRef } from "react";

type EmailInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
};

export default function EmailInput({
  id,
  value,
  onChange,
  className = "",
  inputClassName = "",
  placeholder = "your@email.com",
  required = false,
  autoComplete = "email",
}: EmailInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function insertAtSign() {
    const input = inputRef.current;

    if (value.includes("@")) {
      input?.focus();
      return;
    }

    onChange(`${value}@`);
    requestAnimationFrame(() => {
      input?.focus();
    });
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        id={id}
        type="email"
        inputMode="email"
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClassName}
      />
      <button
        type="button"
        aria-label="@を入力"
        onClick={insertAtSign}
        className="absolute right-2 top-1/2 flex h-9 w-11 -translate-y-1/2 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 text-base font-black text-slate-800 shadow-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        @
      </button>
    </div>
  );
}
