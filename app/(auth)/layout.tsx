export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden auth-bg">
      {/* Ambient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--auth-orb-1) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--auth-orb-2) 0%, transparent 70%)" }} />
      <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--auth-orb-1) 0%, transparent 70%)", transform: "translate(-50%,-50%)", opacity: 0.5 }} />

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--auth-grid) 1px, transparent 1px),linear-gradient(90deg, var(--auth-grid) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />

      {children}
    </div>
  );
}
