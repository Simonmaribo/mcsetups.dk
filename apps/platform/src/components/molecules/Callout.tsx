import * as React from "react"
import { VariantProps, cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const variants = cva(
    "flex flex-col overflow-hidden p-3 text-sm rounded-md",
    {
        variants: {
            color: {
                red: "text-red-800 bg-red-100 border-red-300",
                green: "text-green-800 bg-green-100 border-green-300",
                blue: "text-blue-800 bg-blue-100 border-blue-300",
                yellow: "text-yellow-800 bg-yellow-100 border-yellow-300",
                gray: "text-gray-800 bg-gray-100 border-gray-300",
                teal: "text-teal-800 bg-teal-100 border-teal-300",
                orange: "text-orange-800 bg-orange-100 border-orange-300",
                purple: "text-purple-800 bg-purple-100 border-purple-300",
                pink: "text-pink-800 bg-pink-100 border-pink-300",
                indigo: "text-indigo-800 bg-indigo-100 border-indigo-300",
            },
            variant: {
                outline: "border",
                solid: "border-0",
            }
        },
        compoundVariants: [
            { color: "red", variant: "outline", className: "border-red-600" },
            { color: "green", variant: "outline", className: "border-green-600" },
            { color: "blue", variant: "outline", className: "border-blue-600" },
            { color: "yellow", variant: "outline", className: "border-yellow-600" },
            { color: "gray", variant: "outline", className: "border-gray-600" },
            { color: "teal", variant: "outline", className: "border-teal-600" },
            { color: "orange", variant: "outline", className: "border-orange-600" },
            { color: "purple", variant: "outline", className: "border-purple-600" },
            { color: "pink", variant: "outline", className: "border-pink-600" },
            { color: "indigo", variant: "outline", className: "border-indigo-600" },
        ],
        defaultVariants: {
            color: "green",
            variant: "solid",
        }
    }
)

export interface CalloutProps
    extends VariantProps<typeof variants> {
        className?: string;
        children?: React.ReactNode;
        title?: React.ReactNode;
        action?: React.ReactNode;
    }

const Callout = React.forwardRef<HTMLDivElement, CalloutProps>(
  ({ className, children, color, variant, title, action, ...props }, ref) => {
    return (
      <div
        className={cn(variants({ color, variant, className }))}
        ref={ref}
        {...props}
      >
        {title && (
            <h4 className="font-semibold">{title}</h4>
        )}
        <div className="overflow-y-auto mt-2">
            {children}
        </div>
        {action && (
            <div className="mt-2">
                {action}
            </div>
        )}
        </div>
    )
  }
)
Callout.displayName = "Callout"

export { Callout, variants }
