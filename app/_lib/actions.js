"use server"

import { revalidatePath } from "next/cache"
import { auth, signIn, signOut } from "./auth"
import supabase from "./supabase"
import { getBooking, getBookings, getSettings } from "./data-service"
import { redirect } from "next/navigation"

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" })
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" })
}

export async function updateGuest(formData) {
  const session = await auth()
  if (!session) throw new Error("You must be logged in")

  const nationalID = formData.get("nationalID")
  const [nationality, countryFlag] = formData.get("nationality").split("%")

  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID)) throw new Error("Please provide a valid national ID")

  const updateData = { nationality, countryFlag, nationalID }

  const { data, error } = await supabase.from("guests").update(updateData).eq("id", session.user.guestId)

  if (error) throw new Error("Guest could not be updated")
  revalidatePath("/account/profile")
}

export async function deleteReservation(bookingId) {
  const session = await auth()
  if (!session) throw new Error("You must be logged in")

  const guestBookings = await getBookings(session.user.guestId)
  const guestBookingIds = guestBookings.map(booking => booking.id)

  if (!guestBookingIds.includes(bookingId)) throw new Error("Unauthorized action")

  const { data, error } = await supabase.from("bookings").delete().eq("id", bookingId)

  if (error) throw new Error("Booking could not be deleted")
  revalidatePath("/account/reservations")
}

export async function createReservation(bookingData, formData) {
  const session = await auth()

  if (!session) throw new Error("You must be logged in")

  const settings = await getSettings()
  const { breakfastPrice } = settings

  const { cabinId, numNights, cabinPrice } = bookingData
  const numGuests = Number(formData.get("numGuests"))

  const hasBreakfast = formData.get("hasBreakfast") === "on"
  const extrasPrice = hasBreakfast ? numGuests * numNights * breakfastPrice : 0

  const newBooking = {
    ...bookingData,
    guestId: session.user.guestId,
    status: "unconfirmed",
    extrasPrice,
    totalPrice: cabinPrice + extrasPrice,
    isPaid: false,
    hasBreakfast,
    numGuests,
    observations: formData.get("observations").slice(0, 1000)
  }

  console.log(newBooking)

  const { data, error } = await supabase
    .from("bookings")
    .insert([newBooking])
    // So that the newly created object gets returned!
    .select()
    .single()

  if (error) throw new Error("Booking could not be created")

  revalidatePath(`/cabins/${cabinId}`)

  redirect("/thankyou")
}

export async function updateReservation(formData) {
  const session = await auth()

  if (!session) throw new Error("You must be logged in")

  const bookingId = Number(formData.get("bookingId"))
  const guestBookings = await getBookings(session.user.guestId)
  const guestBookingsIds = guestBookings.map(booking => booking.id)

  if (!guestBookingsIds.includes(bookingId)) throw new Error("Unauthorized action")

  const booking = await getBooking(bookingId)
  const { hasBreakfast, numNights, cabinPrice } = booking

  const settings = await getSettings()
  const { breakfastPrice } = settings

  const numGuests = Number(formData.get("numGuests"))
  const extrasPrice = hasBreakfast ? numGuests * numNights * breakfastPrice : 0
  const totalPrice = cabinPrice + extrasPrice

  const updateData = {
    numGuests,
    extrasPrice,
    totalPrice,
    observations: formData.get("observations").slice(0, 1000)
  }

  const { error } = await supabase.from("bookings").update(updateData).eq("id", bookingId).select().single()

  if (error) throw new Error("Booking could not be updated")

  revalidatePath(`/account/reservations/edit/${bookingId}`)
  revalidatePath("/account/reservations")
  redirect("/account/reservations")
}
