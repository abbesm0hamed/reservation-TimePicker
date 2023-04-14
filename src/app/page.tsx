"use client"

import { useMemo, useState } from "react"
import { cn, dayNames } from "./lib/utils"
import {
  add,
  addDays,
  addHours,
  eachDayOfInterval,
  eachMinuteOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isAfter,
  isBefore,
  isEqual,
  isSameMonth,
  isThisMonth,
  isToday,
  parse,
  parseISO,
  set,
  startOfDay,
  startOfToday,
  startOfWeek,
  startOfYesterday,
} from "date-fns"
import { Inter } from "next/font/google"
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"
import AvailableHours from "./components/hours"
import TimesBar from "./components/timesBar"

const inter = Inter({ subsets: ["latin"], weight: "400" })



export default function Home() {
  
  // display div of availables times
  const [calendarTouched, setCalendarTouched] = useState<Boolean>(false)

  // handle dates
  let today = startOfToday()
  let [currentMonth, setCurrentMonth] = useState(format(today, "MMM-yyyy"))
  let [selectedDay, setSelectedDay] = useState(today)
  let firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date())
  let days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth), { weekStartsOn: 1 }),
  })

  // console.log(addDays(new Date(addHours(today, 4)), 3).toString())
  // reservations array 
  const reservations = [
    addHours(today, 5).toString(),
    addHours(today, 6).toString(),
    addHours(today, 7).toString(),
    addHours(today, 8).toString(),
    addHours(today, 9).toString(),
    addDays(new Date(addHours(today, 4)), 3).toString(),
  ]


  // send available times for the selected day to the hours component
  let [freeTimes, setFreeTimes] = useState<Date[]>([])

  // all days avaiilable times in this month until you change it 
  const [availableTimesInThisMonth, setAvailableTimesInThisMonth] = useState<
    number[]
    >([])
  const [availableTimesInThisMonthForEachDay, setAvailableTimesInThisMonthForEachDay] = useState<Date[][]>([])

  // next and prev month functions
  function prevMonth() {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }
  function nextMonth() {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  // get available times for the selected day
  useMemo(() => {
    const StartOfToday = startOfDay(selectedDay)
    const endOfToday = endOfDay(selectedDay)
    // change your working hours here
    const startHour = set(StartOfToday, { hours: 1 })
    const endHour = set(endOfToday, { hours: 17, minutes: 45 })
    let hoursInDay = eachMinuteOfInterval(
      {
        start: startHour,
        end: endHour,
      },
      { step: 15 }
    )

    // filter the available hours
    let freeTimes = hoursInDay.filter(
      (hour) => !reservations.includes(parseISO(hour.toISOString()).toString())
    )
    setFreeTimes(freeTimes)
    
  }, [selectedDay])

  // calculate the number of available times for each day in this month
  useMemo(() => {
    let thisMonthTimesLength: number[] = []
    let thisMonthTimesEachDay: Date[][] = []
    days.map((day, dayIdx) => {
      // get times

      const StartOfToday = startOfDay(day)
      const endOfToday = endOfDay(day)
      // change your working hours here
      const startHour = set(StartOfToday, { hours: 1 })
      const endHour = set(endOfToday, { hours: 17, minutes: 45 })
      let hoursInDay = eachMinuteOfInterval(
        {
          start: startHour,
          end: endHour,
        },
        { step: 15 }
      )
      // filter the available hours
      let freeTimes = hoursInDay.filter(
        (hour) =>
          !reservations.includes(parseISO(hour.toISOString()).toString())
      )
      thisMonthTimesLength.push(freeTimes.length)
      thisMonthTimesEachDay.push(freeTimes)
    })

    setAvailableTimesInThisMonth(thisMonthTimesLength)
    setAvailableTimesInThisMonthForEachDay(thisMonthTimesEachDay)

  }, [currentMonth])

  return (
    <div className="flex flex-col min-h-screen justify-center items-center gap-2 bg-stone-50">
      <div className={cn("flex flex-col gap-2 justify-center items-center")}>
        <span className="font-serif text-xl sm:text-2xl font-semibold text-teal-900 px-4 sm:px-2">
          Custom reservation calendar that returns available times in a selected date
        </span>
        <span className="text-lg sm:text-xl text-teal-800 font-serif font-semibold px-2">
          Range of times in this example: 01:00 - 17:45
        </span>
      </div>

      {/* calendar implementation */}
      <div className="flex flex-col gap-2 h-[450px] w-[380px] mt-12">
        {/* calendar header */}
        <div className="grid grid-cols-3">
          <button
            type="button"
            onClick={prevMonth}
            disabled={isThisMonth(new Date(currentMonth))}
          >
            <ChevronLeft
              size={20}
              aria-hidden="true"
              className={cn(
                isThisMonth(new Date(currentMonth)) && "text-gray-300"
              )}
            />
          </button>
          <h2 className="font-semibold text-orange-950 justify-center flex">
            {format(firstDayCurrentMonth, " MMMM yyyy")}
          </h2>
          <button
            type="button"
            className="flex justify-end"
            onClick={nextMonth}
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>

        {/* calendar body */}
        <div>
          <div className="grid grid-cols-7 mt-4">
            {dayNames.map((day, i) =>
            {
              return(
              <div
                key={i}
                className={cn(
                  "flex justify-center items-center text-sm text-blue-500 w-full py-2",
                  {
                    "text-orange-400 bg-orange-50 rounded-t-lg":
                      day === "Sun" || day === "Sat",
                  }
                )}
              >
                {day}
              </div>
            )})}
          </div>

          <div className="grid grid-cols-7 text-sm">
            {days.map((day, dayIdx) => {
              return (
                <div
                  key={day.toString()}
                  className={cn(
                    dayIdx === 0 && colStartClasses[getDay(day) - 1],
                    "h-14 justify-center flex items-center",
                    (getDay(day) === 0 || getDay(day) === 6) &&
                      "bg-orange-50 rounded-lg"
                  )}
                >
                  <button
                    onClick={() => {
                      setCalendarTouched(true)
                      setSelectedDay(day)
                    }}
                    className={cn(
                      "w-12 h-12 flex flex-col p-2 justify-center items-center rounded-xl gap-0 group bg-gray-50 relative group",
                      isEqual(day, selectedDay) &&
                        "bg-orange-100 text-slate-900 text-lg",
                      isEqual(today, day) && "text-blue-900 bg-blue-50",
                      isBefore(day, today) &&
                        "text-red-800 bg-red-50 cursor-not-allowed",
                      isEqual(today, day) && "text-blue-900 bg-blue-50",
                      isBefore(day, today) && "cursor-not-allowed",
                      isEqual(day, selectedDay) &&
                        isToday(day) &&
                        "bg-blue-200",
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        !isSameMonth(day, firstDayCurrentMonth) &&
                        "text-gray-400",
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        isSameMonth(day, firstDayCurrentMonth) &&
                        "text-gray-900"
                    )}
                    disabled={isBefore(day, today)}
                  >
                    {isAfter(day, startOfYesterday()) && (
                      <span className="hidden group-hover:flex absolute top-0 -translate-x-.5 -translate-y-4 z-10 text-[11px] bg-slate-900 text-slate-100 px-1 rounded-md gap-1">
                        <span>{availableTimesInThisMonth[dayIdx]}</span>
                        <span>Available</span>
                      </span>
                    )}

                    <time
                      dateTime={format(day, "yyyy-MM-dd")}
                      className={cn(
                        "group-hover:text-lg",
                        (isEqual(day, selectedDay) || isToday(day)) &&
                          "font-semibold"
                      )}
                    >
                      {format(day, "d")}
                    </time>

                    <CheckCircle2
                      className={cn(
                        "hidden",
                        isEqual(day, selectedDay) &&
                          "absolute block top-0 right-0 h-[18px] w-[18px] translate-x-1 -translate-y-1 text-orange-900",
                        isEqual(day, today) && "text-blue-900"
                      )}
                    />

                    {isAfter(day, startOfYesterday()) && (
                      <TimesBar
                        times={availableTimesInThisMonthForEachDay[dayIdx]}
                      />
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className={cn(`hidden`, calendarTouched && "block")}>
        <span className="flex items-center w-full justify-center gap-1">
          <span>
            Select your reservation time for
            <span className="text-orange-950 font-semibold pl-1">
              {format(selectedDay, "dd MMMM yyyy").toString()}
            </span>
          </span>
        </span>
        
        <AvailableHours freeTimes={freeTimes} />
      </div>
    </div>
  )
}

let colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
]