import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cn } from "@/lib/utils"

function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) { 
  return (
    <div
      data-slot="field-group"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

function Field({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div 
      data-slot="field"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function FieldLabel({ 
  className, 
  ...props 
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "text-sm font-medium leading-none select-none text-foreground", 
        className
      )}
      {...props}
    />
  )
}

interface FieldMessageProps extends React.ComponentProps<"p"> {
  variant?: "error" | "hint"
}

function FieldMessage({
  children,
  className,
  variant = "hint",
  ...props
}: FieldMessageProps) {
  if (!children) return null

  return (
    <p
      data-slot="field-message"
      className={cn(
        "text-sm",
        variant === "error" ? "text-destructive" : "text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}

function FieldError({ children, className, ...props }: React.ComponentProps<"p">) {
  if (!children) return null

  return (
    <p
      data-slot="field-error"
      className={cn("text-sm text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  )
} 
export { Field, FieldGroup, FieldLabel, FieldMessage, FieldError }