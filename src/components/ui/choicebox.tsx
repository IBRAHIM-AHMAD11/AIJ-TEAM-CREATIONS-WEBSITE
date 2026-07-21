"use client"

import * as React from "react"
// Use the exact same scoped package for both Root and Items
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type ChoiceboxProps = React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>

export const Choicebox = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  ChoiceboxProps
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn("w-full grid gap-2", className)}
    {...props}
  />
))
Choicebox.displayName = "Choicebox"

export type ChoiceboxItemProps = React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>

export const ChoiceboxItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  ChoiceboxItemProps
>(({ className, children, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      "group relative flex cursor-pointer rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition hover:bg-neutral-50 focus:outline-none data-[state=checked]:border-neutral-900 data-[state=checked]:ring-1 data-[state=checked]:ring-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900 dark:data-[state=checked]:border-neutral-50 dark:data-[state=checked]:ring-neutral-50",
      className
    )}
    {...props}
  >
    <div className="flex w-full items-start gap-3">
      {/* Selector Ring Indicator */}
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-neutral-300 group-data-[state=checked]:border-neutral-900 group-data-[state=checked]:bg-neutral-900 dark:border-neutral-700 dark:group-data-[state=checked]:border-neutral-50 dark:group-data-[state=checked]:bg-neutral-50">
        <CircleIcon className="h-1.5 w-1.5 fill-white text-white opacity-0 group-data-[state=checked]:opacity-100 dark:fill-neutral-950 dark:text-neutral-950" />
      </span>
      <div className="flex-1 text-left">
        {children}
      </div>
    </div>
  </RadioGroupPrimitive.Item>
))
ChoiceboxItem.displayName = "ChoiceboxItem"

export const ChoiceboxItemTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h4 className={cn("text-sm font-semibold text-neutral-900 dark:text-neutral-50", className)} {...props} />
)
ChoiceboxItemTitle.displayName = "ChoiceboxItemTitle"

export const ChoiceboxItemDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-xs text-neutral-500 dark:text-neutral-400", className)} {...props} />
)
ChoiceboxItemDescription.displayName = "ChoiceboxItemDescription"