"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { useControllableState } from "../lib/hooks";

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  size?: "sm" | "md";
  /** Label links van de schakelaar in plaats van rechts. */
  labelPosition?: "left" | "right";
}

/** Switch — aan/uit-schakelaar (role="switch"). */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    checked,
    defaultChecked = false,
    onCheckedChange,
    label,
    description,
    size = "md",
    labelPosition = "right",
    className,
    disabled,
    ...rest
  },
  ref
) {
  const [on, setOn] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });

  const control = (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      data-state={on ? "on" : "off"}
      className={cn("lui-switch", `lui-switch-${size}`, !label && !description && className)}
      onClick={(event) => {
        setOn(!on);
        rest.onClick?.(event);
      }}
      {...rest}
    >
      <span className="lui-switch-thumb" />
    </button>
  );

  if (!label && !description) return control;

  return (
    <label className={cn("lui-switch-row", labelPosition === "left" && "lui-switch-row-reverse", disabled && "lui-switch-row-disabled", className)}>
      {control}
      <span className="lui-switch-text">
        {label && <span className="lui-switch-label">{label}</span>}
        {description && <span className="lui-switch-description">{description}</span>}
      </span>
    </label>
  );
});
