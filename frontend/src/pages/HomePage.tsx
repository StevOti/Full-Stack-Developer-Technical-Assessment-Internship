import CallToActionSection from '../components/sections/CallToActionSection'
import HeroSection from '../components/sections/HeroSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white/90 p-5">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Field Registration and Assignment</h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Create new fields, capture core crop details, and assign each field to the responsible agent for execution.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white/90 p-5">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Crop Progress Monitoring</h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Monitor field stages from Planted to Harvested with real-time updates and notes from field agents.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 md:col-span-2 xl:col-span-1">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Risk Alerts and Performance Summary</h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            View dashboard summaries, identify At Risk fields early, and support faster intervention decisions.
          </p>
        </article>
      </section>

      <div className="mt-6">
        <CallToActionSection />
      </div>
    </>
  )
}
