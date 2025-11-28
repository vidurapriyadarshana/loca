import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", isLoading, children, ...props }, ref) => {
        const variants = {
            primary: "bg-tinder-gradient text-white hover:shadow-lg border-transparent",
            secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border-transparent",
            outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/5",
            ghost: "bg-transparent text-gray-600 hover:bg-gray-100 border-transparent",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "relative inline-flex items-center justify-center px-6 py-3 text-base font-bold transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",
                    variants[variant],
                    className
                )}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;
