import UpdateReservationForm from "@/app/_components/UpdateReservationForm"
import { auth } from "@/app/_lib/auth"
import { getBooking, getBookings, getCabin } from "@/app/_lib/data-service"

export default async function Page({ params }) {
  const { bookingId } = params
  const booking = await getBooking(bookingId)
  const { cabinId, numGuests, observations, hasBreakfast } = booking

  const session = await auth()

  const guestBookings = await getBookings(session.user.guestId)
  const guestBookingsIds = guestBookings.map(booking => booking.id)

  if (!guestBookingsIds.includes(Number(bookingId))) throw new Error("Unauthorized action")

  const cabin = await getCabin(cabinId)
  const { maxCapacity } = cabin

  return (
    <div>
      <h2 className="font-semibold text-2xl text-accent-400 mb-7">Edit Reservation #{bookingId}</h2>
      <UpdateReservationForm bookingId={bookingId} maxCapacity={maxCapacity} numGuests={numGuests} observations={observations} hasBreakfast={hasBreakfast} />
    </div>
  )
}
