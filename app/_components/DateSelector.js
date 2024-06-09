"use client"

import { differenceInDays, isPast, isSameDay } from "date-fns"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { useReservation } from "./ReservationContext"
import { isAlreadyBooked } from "../_lib/helpers"

function DateSelector({ cabin, settings, bookedDates }) {
  const { regularPrice, discount, maxCapacity } = cabin
  const { range, setRange, resetRange, hasBreakfast, numGuests } = useReservation()

  const displayRange = isAlreadyBooked(range, bookedDates) ? {} : range

  let extrasPrice = 0
  const { minBookingLength, maxBookingLength, breakfastPrice } = settings

  const numNights = differenceInDays(displayRange?.to, displayRange?.from)
  if (hasBreakfast && numGuests) extrasPrice = numGuests * numNights * breakfastPrice
  const cabinPrice = numNights * (regularPrice - discount)
  const totalPrice = numGuests <= maxCapacity ? cabinPrice + extrasPrice : cabinPrice

  return (
    <div className="flex flex-col justify-between">
      <DayPicker className="pt-12 place-self-center" mode="range" min={minBookingLength + 1} max={maxBookingLength} fromMonth={new Date()} fromDate={new Date()} toYear={new Date().getFullYear() + 5} captionLayout="dropdown" numberOfMonths={2} disabled={curDate => isPast(curDate) || bookedDates.some(date => isSameDay(date, curDate))} onSelect={range => setRange(range)} selected={displayRange} />

      <div className="flex items-center justify-between px-8 bg-accent-500 text-primary-800 h-[72px]">
        <div className="flex items-center gap-6">
          <p className="flex gap-2 items-baseline">
            {discount > 0 ? (
              <>
                <span className="text-2xl">${regularPrice - discount}</span>
                <span className="line-through font-semibold text-primary-700">${regularPrice}</span>
              </>
            ) : (
              <span className="text-2xl">${regularPrice}</span>
            )}
            <span className="">/night</span>
          </p>
          {numNights ? (
            <>
              <p className="bg-accent-600 px-3 py-2 text-2xl">
                <span>&times;</span> <span>{numNights}</span>
              </p>
              <div className="flex flex-col items-center justify-center">
                <p>
                  <span className="text-lg font-bold uppercase">Total</span> <span className="text-2xl font-semibold">${totalPrice}</span>
                </p>
                {extrasPrice > 0 && numGuests <= maxCapacity ? (
                  <p>
                    (<span className="text-sm font-bold uppercase">Breakfast</span> <span className="text-md font-semibold">${extrasPrice}</span>)
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
        </div>

        {range?.from || range?.to ? (
          <button className="border border-primary-800 py-2 px-4 text-sm font-semibold" onClick={resetRange}>
            Clear
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default DateSelector
