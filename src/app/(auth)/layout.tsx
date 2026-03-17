import { DarkModeToggle } from "@/components/common/darkmode-toggle"
import { Shield } from "lucide-react"
import { ReactNode } from "react"

type AuthLayoutProps = {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-svh">
      {/* Left Panel — Brand Showcase */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-[oklch(0.16_0.02_270)] items-center justify-center">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_40%,oklch(0.30_0.15_270/0.4),transparent),radial-gradient(ellipse_60%_40%_at_80%_70%,oklch(0.25_0.12_300/0.3),transparent)]" />

        {/* Geometric grid lines */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Floating geometric shapes */}
        <div className="absolute top-[15%] left-[10%] w-32 h-32 rounded-full border border-white/[0.06] animate-pulse-soft" />
        <div className="absolute bottom-[20%] right-[15%] w-48 h-48 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute top-[40%] right-[10%] w-20 h-20 rotate-45 border border-white/[0.08]" />
        <div className="absolute bottom-[35%] left-[20%] w-16 h-16 rounded-full bg-primary/20 blur-xl" />
        <div className="absolute top-[70%] left-[45%] w-24 h-24 rotate-12 rounded-2xl border border-white/[0.05]" />

        {/* Brand content */}
        <div className="relative z-10 px-16 max-w-xl animate-fade-in-up">
          <div className="flex items-center gap-4 mb-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 shadow-2xl">
              <Shield className="size-7 text-white/90" />
            </div>
            <span className="text-white/90 text-2xl font-bold tracking-tight">HRIS App</span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            Manage your
            <br />
            <span className="text-primary">workforce</span>
            <br />
            with clarity.
          </h1>

          <p className="text-white/40 text-lg leading-relaxed max-w-md">
            Streamlined attendance, payroll, and employee management — all in one place.
          </p>

          {/* Decorative line */}
          <div className="mt-12 flex items-center gap-3">
            <div className="h-px w-12 bg-white/20" />
            <span className="text-white/20 text-xs font-medium tracking-[0.2em] uppercase">Human Resource System</span>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-10 bg-background relative">
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="absolute top-4 right-4 z-10">
          <DarkModeToggle />
        </div>

        {/* Mobile brand — only shows on small screens */}
        <div className="flex lg:hidden items-center gap-3 mb-8 animate-fade-in-up">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Shield className="size-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">HRIS App</span>
        </div>

        <div className="relative w-full max-w-[400px] animate-fade-in-up">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-10 text-xs text-muted-foreground/50 animate-fade-in-up stagger-4">
          &copy; 2026 HRIS App. All rights reserved.
        </p>
      </div>
    </div>
  )
}
