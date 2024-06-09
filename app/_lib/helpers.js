import { isWithinInterval } from "date-fns"

export function isAlreadyBooked(range, datesArr) {
  return range?.from && range?.to && datesArr.some(date => isWithinInterval(date, { start: range?.from, end: range?.to }))
}
