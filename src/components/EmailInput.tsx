"use client";

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
  return (
    <input
      id={id}
      name={id}
      type="email"
      inputMode="email"
      autoComplete={autoComplete}
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      enterKeyHint="done"
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${inputClassName} ${className}`.trim()}
    />
  );
}
