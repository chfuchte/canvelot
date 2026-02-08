import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { X } from "lucide-react";

export function Chip({
    children,
    closeable,
    disabled,
    onClose,
    className,
    ...props
}: React.ComponentProps<"span"> & {
    children: React.ReactNode;
    disabled?: boolean;
    closeable?: boolean;
    onClose?: () => void;
}) {
    return (
        <Badge
            variant="outline"
            className={cn(
                "text-xs font-semibold",
                disabled && "pointer-events-none cursor-not-allowed opacity-50",
                className,
            )}
            aria-disabled={disabled}
            {...props}>
            {children}
            {closeable && (
                <span
                    className="ml-0.5 cursor-pointer hover:opacity-80"
                    onClick={() => {
                        if (onClose && !disabled) onClose();
                    }}>
                    <X size={14} />
                </span>
            )}
        </Badge>
    );
}
