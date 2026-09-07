import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20",
      secondary: "bg-[#EA580C] text-white hover:bg-[#C2410C] shadow-lg shadow-orange-900/20",
      outline: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
      ghost: "hover:bg-slate-100 text-slate-700",
      link: "text-[#EA580C] underline-offset-4 hover:underline",
    }
    
    const sizes = {
      default: "h-12 px-6 py-3",
      sm: "h-9 rounded-lg px-3",
      lg: "h-14 rounded-xl px-8",
      icon: "h-12 w-12",
    }

    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ""}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
