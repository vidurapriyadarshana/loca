import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="text-sm font-medium text-gray-700 ml-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-primary focus:ring-0 transition-all duration-200 outline-none placeholder:text-gray-400",
                        error && "border-red-500 focus:border-red-500",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-sm text-red-500 ml-1">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
