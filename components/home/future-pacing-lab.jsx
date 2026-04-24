"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

function money(value) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

function pct(value, max) {
  if (!max) return 0;
  return Math.max(10, Math.min(100, Math.round((value / max) * 100)));
}

export function FuturePacingLab({ data }) {
  const [trackId, setTrackId] = useState(data?.tracks?.[0]?.id || "");
  const currentTrack = useMemo(
    () => data?.tracks?.find((item) => item.id === trackId) || data?.tracks?.[0],
    [data?.tracks, trackId]
  );
  const [cityId, setCityId] = useState(currentTrack?.cities?.[0]?.id || "");
  const currentCity = useMemo(
    () => currentTrack?.cities?.find((city) => city.id === cityId) || currentTrack?.cities?.[0],
    [currentTrack, cityId]
  );

  const salaryHeadroom = currentCity ? currentCity.month12Salary - currentCity.month12Rent : 0;
  const maxSalary = useMemo(
    () => Math.max(...(currentTrack?.cities?.map((city) => city.month12Salary) || [1])),
    [currentTrack]
  );

  if (!data || !currentTrack || !currentCity) return null;

  return (
    <section className="mt-8 rounded-[2rem] border border-brand-plum/10 bg-white/90 p-6 shadow-lux backdrop-blur-sm md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-rose">Lifestyle projection</p>
          <h3 className="text-2xl font-semibold tracking-tight text-brand-plum md:text-3xl">{data.title}</h3>
          <p className="text-sm leading-relaxed text-brand-plum/65">{data.subtitle}</p>
        </div>
        <p className="text-xs leading-relaxed text-brand-plum/50 md:max-w-xs">{data.disclaimer}</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {data.tracks.map((track) => (
          <button
            key={track.id}
            type="button"
            onClick={() => {
              setTrackId(track.id);
              setCityId(track.cities?.[0]?.id || "");
            }}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              track.id === currentTrack.id
                ? "border-brand-rose bg-brand-rose text-white"
                : "border-brand-plum/15 bg-white text-brand-plum/80 hover:border-brand-rose/40"
            }`}
          >
            {track.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <motion.article
          key={currentCity.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-3xl border border-brand-plum/10 bg-white"
        >
          <div
            className="relative h-52 bg-cover bg-center md:h-60"
            role="img"
            aria-label={`${currentCity.name} city lifestyle preview`}
            style={{ backgroundImage: `url(${currentCity.heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-brand-plum/70 via-brand-plum/15 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5 text-white">
              <p className="text-xs uppercase tracking-[0.16em] text-white/75">Projected destination</p>
              <h4 className="text-2xl font-bold">{currentCity.name}</h4>
            </div>
          </div>

          <div className="space-y-5 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-brand-cream/70 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-brand-plum/50">Month 12 income</p>
                <strong className="text-xl text-brand-plum">{money(currentCity.month12Salary)}</strong>
              </div>
              <div className="rounded-2xl bg-brand-cream/70 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-brand-plum/50">Rent forecast</p>
                <strong className="text-xl text-brand-plum">{money(currentCity.month12Rent)}</strong>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-brand-plum/55">
                <span>Endowed progress toward stability</span>
                <span>{pct(currentCity.month12Salary, maxSalary)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-brand-plum/10">
                <motion.div
                  key={`${currentCity.id}-progress`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct(currentCity.month12Salary, maxSalary)}%` }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-brand-rose to-brand-gold"
                />
              </div>
            </div>

            <p className="rounded-2xl border border-brand-rose/15 bg-brand-rose/5 px-4 py-3 text-sm text-brand-plum/80">
              {currentCity.socialProof}
            </p>
          </div>
        </motion.article>

        <aside className="space-y-4 rounded-3xl border border-brand-plum/10 bg-gradient-to-b from-white to-brand-cream/50 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-brand-rose">Choose your city context</p>
          <div className="space-y-2">
            {currentTrack.cities.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => setCityId(city.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  city.id === currentCity.id
                    ? "border-brand-rose bg-brand-rose text-white"
                    : "border-brand-plum/15 bg-white text-brand-plum/80 hover:border-brand-rose/40"
                }`}
              >
                <span className="block text-sm font-semibold">{city.name}</span>
                <span className={`text-xs ${city.id === currentCity.id ? "text-white/80" : "text-brand-plum/55"}`}>
                  Community events: {city.communityEvents} / month
                </span>
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-brand-plum/50">Projected disposable buffer</p>
            <strong className="text-2xl text-brand-plum">{money(salaryHeadroom)}</strong>
            <p className="mt-2 text-sm text-brand-plum/65">
              A quick behavioral anchor: this is your estimated room for savings, upskilling, and social life.
            </p>
          </div>

          <div className="rounded-2xl bg-brand-plum p-4 text-brand-cream">
            <p className="text-xs uppercase tracking-[0.14em] text-brand-cream/70">Wellbeing index</p>
            <strong className="text-2xl">{currentCity.wellbeingScore}/100</strong>
            <p className="mt-2 text-sm text-brand-cream/80">
              Designed to reduce uncertainty by translating lifestyle friction into one understandable signal.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
