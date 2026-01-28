import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)} {...props} />
))
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
            className
        )}
        {...props}
    />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
// Simplified: Does not actually toggle tabs in this mock without State/Context, 
// but for the MVP visual it might be 'okay' if I implement a basic state context? 
// Actually, Shadcn Tabs relies on Radix Tabs which handles logic. 
// Writing a full Tabs implementation from scratch is non-trivial for a quick fix.
// I will make a simple implementation that assumes controlled state or just renders. 
// Wait, the user code uses Uncontrolled `<Tabs defaultValue="concepts">`.
// So I need a Context.
>(({ className, ...props }, ref) => (
    <button
        ref={ref}
        className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            className
        )}
        {...props}
    />
))
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
        )}
        {...props}
    />
))
TabsContent.displayName = "TabsContent"

// Simple Context for Tabs
const TabsContext = React.createContext<{ value: string; onValueChange: (v: string) => void }>({ value: "", onValueChange: () => { } });

const TabsRoot = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { defaultValue?: string; value?: string; onValueChange?: (value: string) => void }
>(({ className, defaultValue, value: controlledValue, onValueChange, children, ...props }, ref) => {
    const [value, setValue] = React.useState(defaultValue || "");
    const currentValue = controlledValue !== undefined ? controlledValue : value;
    const handleValueChange = onValueChange || setValue;

    return (
        <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
            <div ref={ref} className={className} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    )
})
TabsRoot.displayName = "Tabs"

// Wrap components to use context
const TabsTriggerWrapped = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, onClick, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const isActive = context.value === value;
    return (
        <TabsTrigger
            ref={ref}
            className={className}
            data-state={isActive ? "active" : "inactive"}
            onClick={(e) => {
                context.onValueChange(value);
                if (onClick) onClick(e);
            }}
            {...props}
        />
    )
})
TabsTriggerWrapped.displayName = "TabsTrigger"

const TabsContentWrapped = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (context.value !== value) return null;
    return <TabsContent ref={ref} className={className} {...props} />
})
TabsContentWrapped.displayName = "TabsContent"

export { TabsRoot as Tabs, TabsList, TabsTriggerWrapped as TabsTrigger, TabsContentWrapped as TabsContent }
