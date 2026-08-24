import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-blue text-white hover:bg-blue-dark",
  outline: "bg-white text-text border border-gray-300 hover:bg-grey-bg",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`whitespace-nowrap rounded-md px-3.5 py-2 text-[12.5px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
