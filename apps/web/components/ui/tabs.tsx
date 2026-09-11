'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  value: string;
  onValueChange: (val: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs sub-components must be used within a Tabs provider');
  }
  return context;
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (val: string) => void;
}

export function Tabs({
  defaultValue = '',
  value: controlledValue,
  onValueChange: setControlledValue,
  className,
  children,
  ...props
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const onValueChange = React.useCallback(
    (val: string) => {
      if (!isControlled) {
        setUncontrolledValue(val);
      }
      setControlledValue?.(val);
    },
    [isControlled, setControlledValue],
  );

  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex h-10 w-full items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  const { value: activeValue, onValueChange } = useTabs();
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onValueChange(value)}
      className={cn(
        'inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
        isActive
          ? 'bg-background text-foreground shadow-xs font-semibold'
          : 'hover:text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: TabsContentProps) {
  const { value: activeValue } = useTabs();
  if (activeValue !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn(
        'mt-4 outline-none animate-in fade-in-50 duration-200',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
