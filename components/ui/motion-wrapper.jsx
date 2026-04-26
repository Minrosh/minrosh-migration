export function MotionReveal({ as: Comp = "div", className = "", children }) {
  return <Comp className={className}>{children}</Comp>;
}

export function MotionStagger({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

export function MotionItem({ className = "", children }) {
  return <div className={className}>{children}</div>;
}
