import { ReactNode, useEffect, useState } from "react";
import { motion } from "motion/react";
import { c } from "./tokens";
import { ChevronLeft } from "lucide-react";
import { useNav } from "./nav";

export function StatusBg({ children }: { children: ReactNode }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: c.bg,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* subtle grain */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          mixBlendMode: "overlay",
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
        }}
      />
      {children}
    </div>
  );
}

export function NavBar({
  title,
  back,
  right,
  large,
  onBack,
}: {
  title?: string;
  back?: boolean;
  right?: ReactNode;
  large?: ReactNode;
  onBack?: () => void;
}) {
  const nav = useNav();
  return (
    <div
      className="absolute left-0 right-0 z-30"
      style={{ top: 50, paddingLeft: 22, paddingRight: 22 }}
    >
      <div className="flex items-center justify-between" style={{ height: 36 }}>
        {back ? (
          <Pressable
            onClick={onBack || nav.back}
            style={{
              width: 34,
              height: 34,
              borderRadius: 100,
              background: "linear-gradient(180deg, #1f1f1f 0%, #161616 100%)",
              border: `1px solid ${c.borderLight}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
              width_: 34,
            }}
            stretch={false}
          >
            <ChevronLeft size={18} color={c.white} strokeWidth={2.2} />
          </Pressable>
        ) : (
          <div style={{ width: 34 }} />
        )}
        {title && (
          <span style={{ fontSize: 14, fontWeight: 600, color: c.white, letterSpacing: -0.2 }}>
            {title}
          </span>
        )}
        <div className="flex items-center justify-end" style={{ minWidth: 34, gap: 8 }}>
          {right}
        </div>
      </div>
      {large && <div style={{ marginTop: 18 }}>{large}</div>}
    </div>
  );
}

export function Eyebrow({ children, style, dot }: { children: ReactNode; style?: any; dot?: string }) {
  return (
    <div
      className="uppercase flex items-center"
      style={{
        fontSize: 10,
        fontWeight: 600,
        color: c.white40,
        letterSpacing: 1.8,
        gap: 6,
        ...style,
      }}
    >
      {dot && (
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: 100,
            background: dot,
            boxShadow: `0 0 8px ${dot}`,
          }}
        />
      )}
      {children}
    </div>
  );
}

export function Pressable({
  children,
  onClick,
  style,
  className,
  stretch = true,
  as = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  style?: any;
  className?: string;
  stretch?: boolean;
  as?: "button" | "div";
}) {
  const Comp: any = as === "div" ? motion.div : motion.button;
  return (
    <Comp
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 600, damping: 30 }}
      role={as === "div" ? "button" : undefined}
      className={`cursor-pointer ${className || ""}`}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        textAlign: "left",
        width: stretch ? "100%" : "auto",
        ...style,
      }}
    >
      {children}
    </Comp>
  );
}

export function ElevatedCard({
  children,
  style,
  glow,
}: {
  children: ReactNode;
  style?: any;
  glow?: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        background: "linear-gradient(180deg, #1d1d1d 0%, #141414 100%)",
        border: `1px solid ${c.borderLight}`,
        borderRadius: 22,
        boxShadow:
          "0 12px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
        overflow: "hidden",
        ...style,
      }}
    >
      {glow && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${glow} 0%, transparent 65%)`,
            pointerEvents: "none",
          }}
        />
      )}
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}

export function AnimatedNumber({
  value,
  duration = 800,
  format = (n: number) => Math.round(n).toLocaleString("fr-FR").replace(/,/g, " "),
  style,
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  style?: any;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const from = display;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <span style={style}>{format(display)}</span>;
}
