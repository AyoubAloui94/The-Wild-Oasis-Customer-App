import Cabin from "@/app/_components/Cabin"
import Reservation from "@/app/_components/Reservation"
import Spinner from "@/app/_components/Spinner"
import { getCabin, getCabins } from "@/app/_lib/data-service"
import { Suspense } from "react"

export async function generateMetadata({ params }) {
  const { cabinId } = await params
  const { name } = await getCabin(cabinId)

  return { title: `Cabin ${name}` }
}

export async function generateStaticParams() {
  const cabins = await getCabins()
  if (!cabins) return []

  const ids = cabins?.map(cabin => ({ cabinId: String(cabin.id) }))

  return ids
}

export default async function Page({ params }) {
  const { cabinId } = await params
  const cabin = await getCabin(cabinId)
  const { id, name } = cabin

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <Cabin cabin={cabin} />
      <div>
        <h2 className="text-5xl font-semibold text-center mb-10 text-accent-400">Reserve {name} today. Pay on arrival.</h2>
        <Suspense fallback={<Spinner />} key={id}>
          <Reservation cabin={cabin} />
        </Suspense>
      </div>
    </div>
  )
}
