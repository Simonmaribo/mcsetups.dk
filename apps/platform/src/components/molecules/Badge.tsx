import * as React from "react"
import { VariantProps, cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const variants = cva(
    "flex-shrink-0 inline-flex justify-center items-center font-medium",
    {
        variants: {
            padding: {
                default: "pl-2.5 pr-2.5 pt-0.5 pb-0.5",
                icon: "p-1",
            },
            variant: {
                default: "",
                outline: "border bg-transparent",
                duotone: "border",
                solid: "text-white",
                subtle: "",
            },
            rounded: {
                full: "rounded-full",
                sm: "rounded",
                md: "rounded-md",
                lg: "rounded-lg",
            },
            color: {
                red: "",
                orange: "",
                yellow: "",
                green: "",
                teal: "",
                blue: "",
                indigo: "",
                purple: "",
                pink: "",
                gray: "",
            },
            size: {
                xs: "text-xs",
                sm: "text-sm",
                md: "text-base",
                lg: "text-lg",
                xl: "text-xl",
                "2xl": "text-2xl",
                "3xl": "text-3xl",
            },
        },
        compoundVariants: [
            { variant: "outline", color: "red", className: "border-red-500 text-red-500" },
            { variant: "outline", color: "orange", className: "border-orange-500 text-orange-500" },
            { variant: "outline", color: "yellow", className: "border-yellow-500 text-yellow-500" },
            { variant: "outline", color: "green", className: "border-green-500 text-green-500" },
            { variant: "outline", color: "teal", className: "border-teal-500 text-teal-500" },
            { variant: "outline", color: "blue", className: "border-blue-500 text-blue-500" },
            { variant: "outline", color: "indigo", className: "border-indigo-500 text-indigo-500" },
            { variant: "outline", color: "purple", className: "border-purple-500 text-purple-500" },
            { variant: "outline", color: "pink", className: "border-pink-500 text-pink-500" },
            { variant: "outline", color: "gray", className: "border-gray-500 text-gray-500" },
            { variant: "duotone", color: "red", className: "border-red-700 bg-red-100 text-red-700" },
            { variant: "duotone", color: "orange", className: "border-orange-700 bg-orange-100 text-orange-700" },
            { variant: "duotone", color: "yellow", className: "border-yellow-700 bg-yellow-100 text-yellow-700" },
            { variant: "duotone", color: "green", className: "border-green-700 bg-green-100 text-green-700" },
            { variant: "duotone", color: "teal", className: "border-teal-700 bg-teal-100 text-teal-700" },
            { variant: "duotone", color: "blue", className: "border-blue-700 bg-blue-100 text-blue-700" },
            { variant: "duotone", color: "indigo", className: "border-indigo-700 bg-indigo-100 text-indigo-700" },
            { variant: "duotone", color: "purple", className: "border-purple-700 bg-purple-100 text-purple-700" },
            { variant: "duotone", color: "pink", className: "border-pink-700 bg-pink-100 text-pink-700" },
            { variant: "duotone", color: "gray", className: "border-gray-700 bg-gray-100 text-gray-700" },
            { variant: "solid", color: "red", className: "bg-red-700" },
            { variant: "solid", color: "orange", className: "bg-orange-600" },
            { variant: "solid", color: "yellow", className: "bg-yellow-500" },
            { variant: "solid", color: "green", className: "bg-green-600" },
            { variant: "solid", color: "teal", className: "bg-teal-700" },
            { variant: "solid", color: "blue", className: "bg-blue-700" },
            { variant: "solid", color: "indigo", className: "bg-indigo-700" },
            { variant: "solid", color: "purple", className: "bg-purple-700" },
            { variant: "solid", color: "pink", className: "bg-pink-700" },
            { variant: "solid", color: "gray", className: "bg-gray-700" },
            { variant: "subtle", color: "red", className: "bg-red-100 text-red-700" },
            { variant: "subtle", color: "orange", className: "bg-orange-100 text-orange-700" },
            { variant: "subtle", color: "yellow", className: "bg-yellow-100 text-yellow-700" },
            { variant: "subtle", color: "green", className: "bg-green-100 text-green-700" },
            { variant: "subtle", color: "teal", className: "bg-teal-100 text-teal-700" },
            { variant: "subtle", color: "blue", className: "bg-blue-100 text-blue-700" },
            { variant: "subtle", color: "indigo", className: "bg-indigo-100 text-indigo-700" },
            { variant: "subtle", color: "purple", className: "bg-purple-100 text-purple-700" },
            { variant: "subtle", color: "pink", className: "bg-pink-100 text-pink-700" },
            { variant: "subtle", color: "gray", className: "bg-gray-100 text-gray-700" },
        ],
        defaultVariants: {
            variant: "duotone",
            rounded: "full",
            size: "md",
            color: "blue",
            padding: "default"
        }
    }
)

export interface BadgeProps
    extends VariantProps<typeof variants> {
        className?: string;
        children?: React.ReactNode;
        leadingContent?: React.ReactNode;
        trailingContent?: React.ReactNode;
    }

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, children, leadingContent, trailingContent, padding, rounded, variant, color, size, ...props }, ref) => {
    return (
      <div
        className={cn(variants({ variant, padding, rounded, color, size, className }))}
        ref={ref}
        {...props}
      >
        {leadingContent && (
            <span className="mr-1.5">{leadingContent}</span>
        )}
        {children}
        {trailingContent && (
            <span className="ml-1.5">{trailingContent}</span>
        )}
        </div>
    )
  }
)
Badge.displayName = "Badge"

export { Badge, variants }
