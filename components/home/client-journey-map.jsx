import { motion } from "framer-motion";

const journeys = [
  {
    name: "Elena",
    pathway: "Skilled Migration (190)",
    steps: [
      { label: "Initial Assessment", date: "Day 1", status: "complete" },
      { label: "Skills Assessment", date: "Month 2", status: "complete" },
      { label: "EOI Lodged", date: "Month 3", status: "complete" },
      { label: "ITA Received", date: "Month 5", status: "complete" },
      { label: "Visa Granted", date: "Month 11", status: "current" },
    ]
  },
  {
    name: "Mark & Sarah",
    pathway: "Partner Visa (820)",
    steps: [
      { label: "Evidence Review", date: "Day 1", status: "complete" },
      { label: "Strategy Session", date: "Week 2", status: "complete" },
      { label: "Lodgement", date: "Month 1", status: "complete" },
      { label: "Bridging Visa", date: "Month 1", status: "complete" },
      { label: "Grant", date: "Month 9", status: "current" },
    ]
  }
];

export function ClientJourneyMap() {
  return (
    <div className="my-16 px-4">
      <div className="text-center mb-12">
        <p className="section-label">Trust in the process</p>
        <h2 className="text-3xl font-extrabold text-brand-plum">Real Client Journeys</h2>
        <p className="text-brand-plum/60 mt-2">Transparent timelines from assessment to grant.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {journeys.map((journey, jIdx) => (
          <div key={journey.name} className="p-8 rounded-[2.5rem] bg-white border border-brand-plum/10 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-brand-plum">{journey.name}</h3>
              <span className="px-3 py-1 rounded-full bg-brand-rose/10 text-brand-rose text-xs font-bold uppercase tracking-wider">
                {journey.pathway}
              </span>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-brand-plum/10" />
              <div className="space-y-8 relative">
                {journey.steps.map((step, sIdx) => (
                  <motion.div 
                    key={step.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (jIdx * 5 + sIdx) * 0.1 }}
                    className="flex items-center gap-6"
                  >
                    <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                      step.status === "complete" 
                        ? "bg-brand-plum border-brand-plum text-white" 
                        : "bg-white border-brand-rose text-brand-rose animate-pulse"
                    }`}>
                      {step.status === "complete" ? "✓" : sIdx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-brand-plum leading-none">{step.label}</p>
                      <p className="text-xs text-brand-plum/50 mt-1">{step.date}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
