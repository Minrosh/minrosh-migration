export function BrisbaneParallax() {
  return (
    <section className="brisbane-parallax relative h-[400px] overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/brisbane-aerial.png')" }}
      />
      <div className="absolute inset-0 bg-brand-plum/60 z-10" />
      <div className="relative z-20 mx-auto flex h-full max-w-7xl items-center justify-center px-4 text-center">
        <div>
          <span className="text-brand-gold font-bold tracking-[0.2em] text-sm uppercase">Local Brisbane Expertise</span>
          <h2 className="text-4xl md:text-5xl font-serif text-white mt-4">Brisbane Born. Globally Connected.</h2>
          <p className="text-white/80 max-w-2xl mx-auto mt-6 text-lg">
            Operating from the heart of Queensland, we provide face-to-face migration strategy with a global perspective.
          </p>
        </div>
      </div>
    </section>
  );
}
