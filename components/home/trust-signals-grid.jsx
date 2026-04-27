import { motion } from "framer-motion";

const signals = [
  {
    title: "Registered Expertise",
    description: "Every pathway is verified against current legislative frameworks to ensure your application stands on firm ground.",
    icon: "⚖️",
  },
  {
    title: "Document Strategy",
    description: "We don't just list documents; we build an evidence strategy that addresses potential weak points before lodgement.",
    icon: "📋",
  },
  {
    title: "Process Clarity",
    description: "From first review to visa grant, you'll always know the 'why' behind every step and the timeline to expect.",
    icon: "✨",
  },
  {
    title: "Direct Human Review",
    description: "While our AI provides the roadmap, every complex case is double-checked by experienced professionals.",
    icon: "🤝",
  }
];

export function TrustSignalsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-12">
      {signals.map((signal, idx) => (
        <motion.div
          key={signal.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className="p-6 rounded-3xl border border-brand-plum/10 bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-4">{signal.icon}</div>
          <h3 className="text-lg font-bold text-brand-plum mb-2">{signal.title}</h3>
          <p className="text-sm text-brand-plum/70 leading-relaxed">
            {signal.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
