import { ReactNode } from "react";

export function PhoneFrame({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative shrink-0"
        style={{
          width: 360,
          height: 760,
          borderRadius: 52,
          padding: 10,
          background: "linear-gradient(180deg, #1f1f1f 0%, #0c0c0c 100%)",
          boxShadow:
            "0 0 0 1.5px rgba(255,255,255,0.08), 0 40px 80px -20px rgba(0,0,0,0.8), 0 20px 40px -10px rgba(127,227,0,0.05)",
        }}
      >
        <div
          className="relative overflow-hidden"
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 42,
            background: "#0A0A0A",
          }}
        >
          {/* Dynamic island */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-50"
            style={{
              top: 10,
              width: 110,
              height: 32,
              borderRadius: 100,
              background: "#000",
            }}
          />
          {/* Status bar */}
          <div
            className="absolute left-0 right-0 z-40 flex items-center justify-between"
            style={{
              top: 14,
              paddingLeft: 28,
              paddingRight: 28,
              color: "#F0F0F0",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                <path d="M1 9.5h2v1H1zM4.5 7h2v3.5h-2zM8 4h2v6.5H8zM11.5 1h2v9.5h-2z" fill="#F0F0F0"/>
              </svg>
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                <path d="M7 1.5C9 1.5 10.8 2.2 12.2 3.5l-1.4 1.4C9.7 3.9 8.4 3.4 7 3.4S4.3 3.9 3.2 4.9L1.8 3.5C3.2 2.2 5 1.5 7 1.5zM7 5.3c1 0 1.9.4 2.6 1l-1.4 1.4c-.3-.3-.7-.5-1.2-.5s-.9.2-1.2.5L4.4 6.3c.7-.6 1.6-1 2.6-1zM7 8.2c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9z" fill="#F0F0F0"/>
              </svg>
              <div className="flex items-center" style={{ gap: 2 }}>
                <div style={{ width: 22, height: 11, borderRadius: 3, border: "1px solid rgba(240,240,240,0.6)", padding: 1 }}>
                  <div style={{ width: "85%", height: "100%", borderRadius: 1.5, background: "#F0F0F0" }} />
                </div>
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
      {label && (
        <span
          className="uppercase"
          style={{ fontSize: 11, fontWeight: 500, color: "rgba(240,240,240,0.40)", letterSpacing: 1.5 }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
