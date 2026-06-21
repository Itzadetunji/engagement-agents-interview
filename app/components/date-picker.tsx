"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  id?: string;
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledDates?: (date: Date) => boolean;
  className?: string;
}

export function DatePicker({
  id,
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled,
  disabledDates,
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-start gap-2 px-3 font-normal",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0" />
          {date ? format(date, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          disabled={disabledDates}
        />
      </PopoverContent>
    </Popover>
  );
}

function formatDateRange(range: DateRange | undefined): string {
  if (!range?.from) return "";

  if (!range.to) {
    return format(range.from, "LLL dd, y");
  }

  if (format(range.from, "yyyy-MM-dd") === format(range.to, "yyyy-MM-dd")) {
    return format(range.from, "LLL dd, y");
  }

  return `${format(range.from, "LLL dd, y")} – ${format(range.to, "LLL dd, y")}`;
}

interface DateRangePickerProps {
  id?: string;
  range?: DateRange;
  onRangeChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DateRangePicker({
  id,
  range,
  onRangeChange,
  placeholder = "Pick a date range",
  disabled,
  className,
}: DateRangePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-start gap-2 px-3 font-normal",
            !range?.from && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0" />
          {range?.from ? formatDateRange(range) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={range?.from}
          selected={range}
          onSelect={onRangeChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
