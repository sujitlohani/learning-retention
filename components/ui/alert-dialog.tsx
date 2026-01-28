import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

// Simple mock AlertDialog that renders as a standard Dialog/Modal
// Using a simple state-based implementation if possible, but AlertDialog usually relies on Portal/Radix.
// For MVP without installing packages, we'll build a simple fixed overlay.

// Context to manage open state if it's uncontrolled, but usually it's used with <AlertDialogTrigger>
const AlertDialogContext = React.createContext<{ open: boolean; setOpen: (o: boolean) => void }>({ open: false, setOpen: () => { } });

const AlertDialog = ({ children, open: controlledOpen, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => {
    const [open, setOpen] = React.useState(false);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : open;
    const handleOpenChange = (newOpen: boolean) => {
        if (!isControlled) setOpen(newOpen);
        if (onOpenChange) onOpenChange(newOpen);
    };

    return (
        <AlertDialogContext.Provider value={{ open: !!isOpen, setOpen: handleOpenChange }}>
            {children}
        </AlertDialogContext.Provider>
    );
}

const AlertDialogTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, onClick, asChild, children, ...props }, ref) => {
    const { setOpen } = React.useContext(AlertDialogContext);

    // If asChild is true, we should clone the child, but for simplicity in this mock we'll just render it
    // and try to attach the click handler. 
    // This is "Good Enough" for the MVP button wrapping.
    if (asChild && React.isValidElement(children)) {
        const child = children as React.ReactElement<any>;
        return React.cloneElement(child, {
            onClick: (e: React.MouseEvent) => {
                setOpen(true);
                if (child.props.onClick) child.props.onClick(e);
            }
        });
    }

    return (
        <Button
            ref={ref}
            className={className}
            onClick={(e) => {
                setOpen(true);
                if (onClick) onClick(e);
            }}
            {...props}
        >
            {children}
        </Button>
    )
})
AlertDialogTrigger.displayName = "AlertDialogTrigger"

const AlertDialogContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const { open, setOpen } = React.useContext(AlertDialogContext);
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

            {/* Content */}
            <div
                ref={ref}
                className={cn(
                    "fixed z-50 grid w-full max-w-lg scale-100 gap-4 border bg-background p-6 opacity-100 shadow-lg sm:rounded-lg md:w-full",
                    className
                )}
                {...props}
            />
        </div>
    )
})
AlertDialogContent.displayName = "AlertDialogContent"

const AlertDialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-2 text-center sm:text-left",
            className
        )}
        {...props}
    />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn("text-lg font-semibold", className)}
        {...props}
    />
))
AlertDialogTitle.displayName = "AlertDialogTitle"

const AlertDialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
AlertDialogDescription.displayName = "AlertDialogDescription"

const AlertDialogAction = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
    const { setOpen } = React.useContext(AlertDialogContext);
    return (
        <Button
            ref={ref}
            className={cn(className)}
            onClick={(e) => {
                setOpen(false);
                if (onClick) onClick(e);
            }}
            {...props}
        />
    )
})
AlertDialogAction.displayName = "AlertDialogAction"

const AlertDialogCancel = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
    const { setOpen } = React.useContext(AlertDialogContext);
    return (
        <Button
            variant="outline"
            ref={ref}
            className={cn("mt-2 sm:mt-0", className)}
            onClick={(e) => {
                setOpen(false);
                if (onClick) onClick(e);
            }}
            {...props}
        />
    )
})
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
}
