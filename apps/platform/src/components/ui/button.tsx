import * as React from "react"
import { VariantProps, cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "cursor-pointer active:scale-95 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none data-[state=open]:bg-slate-100",
  {
    variants: {
      size: {
        none: "",
        default: "h-10 py-2 px-4",
        sm: "h-9 px-2 rounded-md",
        lg: "h-11 px-8 rounded-md",
      },
      variant: {
        default:
          "bg-slate-900 text-white hover:bg-slate-700",
        white:
          "bg-white text-slate-900 hover:bg-slate-100",
        blue: 
          "bg-blue-500 text-white hover:bg-blue-600",
        emerald:
          "bg-emerald-500 text-white hover:bg-emerald-600",
        sale: 
          "bg-yellow-500 text-white hover:bg-yellow-600",
        destructive:
          "bg-red-500 text-white hover:bg-red-600",
        success:
          "bg-green-500 text-white hover:bg-green-600",
        outline:
          "bg-transparent border border-slate-200 hover:bg-slate-100",
        subtle:
          "bg-slate-100 text-slate-900 hover:bg-slate-200",
        "subtle-destructive":
          "bg-red-100 text-red-500 hover:bg-red-200",
        "subtle-success":
          "bg-green-100 text-green-500 hover:bg-green-200",
        ghost:
          "bg-transparent hover:bg-slate-100 data-[state=open]:bg-transparent ",
        link: "bg-transparent underline-offset-4 hover:underline text-slate-900 hover:bg-transparent px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export interface DivButtonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonVariants> {}
  
export interface AnchorButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

const DivButton = React.forwardRef<HTMLDivElement, DivButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

const AnchorButton = React.forwardRef<HTMLAnchorElement, AnchorButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <a
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        role='button'
        tabIndex={0}
        {...props}
      />
    )
  }
)


Button.displayName = "Button"
DivButton.displayName = "DivButton"
AnchorButton.displayName = "AnchorButton"

export { Button, DivButton, AnchorButton, buttonVariants }
