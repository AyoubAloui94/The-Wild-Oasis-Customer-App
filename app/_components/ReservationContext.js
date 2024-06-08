"use client"

import { createContext, useContext, useState } from "react"

const ReservationContext = createContext()

const initialState = { from: undefined, to: undefined }

function ReservationProvider({ children }) {
  const [range, setRange] = useState(initialState)

  function resetRange() {
    setRange({ from: undefined, to: undefined })
  }

  return <ReservationContext.Provider value={{ range, setRange, resetRange }}>{children}</ReservationContext.Provider>
}

function useReservation() {
  const context = useContext(ReservationContext)

  if (context == undefined) throw new Error("ReservationContext was used outside of ReservationProvider")

  return context
}

export { ReservationProvider, useReservation }
