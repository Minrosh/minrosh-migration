import "./admin.css";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <div className="admin-root min-h-screen bg-background text-foreground">{children}</div>;
}
