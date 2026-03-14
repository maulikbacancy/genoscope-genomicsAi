export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#0a0f1e" }}>
      {/* Ambient background orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }} />
      <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)", transform: "translate(-50%, -50%)" }} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px"
        }} />

      {children}
    </div>
  );
}
