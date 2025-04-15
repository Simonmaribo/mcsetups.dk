import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
 
import { cn } from "@/lib/utils"
import { Button, DivButton } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { PopoverClose } from "@radix-ui/react-popover"
 
export function DatePicker({
  className,
  date,
  onDateChange,
}: React.HTMLAttributes<HTMLDivElement> & {
    date?: DateRange
    onDateChange: (date: DateRange | undefined) => void
}) {

  const [currentDate, setCurrentDate] = React.useState<DateRange | undefined>(date)
 
  const confirmDate = () => {
    onDateChange(currentDate)
  }

  const clearDate = () => {
    setCurrentDate({
        from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        to: new Date(),
    })
    onDateChange({
        from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        to: new Date(),
    })
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !currentDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {currentDate?.from ? (
              currentDate.to ? (
                <>
                  {format(currentDate.from, "LLL dd, y")} -{" "}
                  {format(currentDate.to, "LLL dd, y")}
                </>
              ) : (
                format(currentDate.from, "LLL dd, y")
              )
            ) : (
              <span>Vælg en dato</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={currentDate?.from}
            selected={currentDate}
            onSelect={setCurrentDate}
            numberOfMonths={2}
            disabled={{ after: addDays(new Date(), 1) }}
          />
          <div className="flex justify-end p-4">
            <PopoverClose>
                <DivButton
                    variant="outline"
                    className="mr-2"
                    onClick={() => clearDate()}
                >
                    Ryd
                </DivButton>
            </PopoverClose>
            <PopoverClose>
                <DivButton onClick={confirmDate}>Bekræft</DivButton>
            </PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}