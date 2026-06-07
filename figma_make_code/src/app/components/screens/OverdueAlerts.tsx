import { motion } from "motion/react";
import { c } from "../tokens";
import { StatusBg, NavBar, Eyebrow, Pressable, AnimatedNumber } from "../Chrome";
import { Phone, AlertTriangle, ChevronRight } from "lucide-react";
import { useNav } from "../nav";
import { STORES, fmt } from "../data";

export function OverdueAlerts() {
  const nav = useNav();
  const alerts = STORES.filter((s) => s.daysSincePayment >= 10).sort(
    (a, b) => b.daysSincePayment - a.daysSincePayment
  );
  const byDebt = STORES.filter((s) => s.debt > 0).sort((a, b) => b.debt - a.debt);
  const totalAlertDebt = alerts.reduce((s, a) => s + a.debt, 0);

  return (
    <StatusBg>
      <NavBar back title="Impayés" />

      <div className="absolute inset-0 overflow-y-auto" style={{ paddingTop: 105, paddingBottom: 24 }}>
        {/* Warning banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ padding: "0 22px 22px", position: "relative" }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -40,
              left: -40,
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,77,77,0.10) 0%, transparent 65%)",
              filter: "blur(20px)",
              pointerEvents: "none",
            }}
          />
          <div
            className="relative flex items-start"
            style={{
              gap: 12,
              padding: 16,
              borderRadius: 18,
              background:
                "linear-gradient(135deg, rgba(255,77,77,0.10) 0%, rgba(255,77,77,0.04) 100%)",
              border: "1px solid rgba(255,77,77,0.20)",
              boxShadow: "0 8px 24px rgba(255,77,77,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: c.redDim,
                border: "1px solid rgba(255,77,77,0.25)",
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={16} color={c.red} strokeWidth={2.4} />
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: 13, fontWeight: 600, color: c.white, marginBottom: 4 }}>
                {alerts.length} magasin{alerts.length > 1 ? "s" : ""} — plus de 10 jours sans paiement
              </div>
              <div className="flex items-baseline" style={{ gap: 4 }}>
                <AnimatedNumber
                  value={totalAlertDebt}
                  duration={900}
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: c.red,
                    letterSpacing: -0.8,
                    fontVariantNumeric: "tabular-nums",
                  }}
                />
                <span style={{ fontSize: 11, color: c.white40, fontWeight: 500 }}>DA</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* MAGASINS EN ALERTE */}
        <Eyebrow style={{ paddingLeft: 22, paddingRight: 22, marginBottom: 12 }} dot={c.red}>
          Magasins en alerte
        </Eyebrow>
        <div style={{ padding: "0 22px 28px" }}>
          {alerts.map((a, i) => {
            const severity = Math.min(1, a.daysSincePayment / 20);
            const color = severity > 0.8 ? c.red : c.amber;
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i + 0.15, duration: 0.35 }}
              >
                <Pressable
                  onClick={() => nav.go("storeProfile", { storeId: a.id })}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 0",
                    borderBottom: i === alerts.length - 1 ? "none" : `1px solid ${c.borderLight}`,
                  }}
                >
                  <div
                    className="relative flex items-center justify-center"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: "linear-gradient(135deg, #2a2a2a 0%, #161616 100%)",
                      border: `1px solid ${c.borderLight}`,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, color: c.white }}>{a.initials}</span>
                    <div
                      className="absolute"
                      style={{
                        bottom: -3,
                        right: -3,
                        width: 16,
                        height: 16,
                        borderRadius: 100,
                        background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
                        border: `2.5px solid ${c.bg}`,
                        boxShadow: `0 0 10px ${color}80`,
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: c.white,
                        marginBottom: 3,
                        letterSpacing: -0.2,
                      }}
                    >
                      {a.name}
                    </div>
                    <div style={{ fontSize: 11, color }}>
                      Dernier paiement : il y a {a.daysSincePayment} jours
                    </div>
                  </div>
                  <Pressable
                    as="div"
                    stretch={false}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 100,
                      background: "linear-gradient(180deg, #1f1f1f 0%, #161616 100%)",
                      border: `1px solid ${c.borderLight}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                  >
                    <Phone size={13} color={c.white} strokeWidth={2.2} />
                  </Pressable>
                </Pressable>
              </motion.div>
            );
          })}
        </div>

        {/* TOUS LES MAGASINS PAR DETTE */}
        <Eyebrow style={{ paddingLeft: 22, paddingRight: 22, marginBottom: 12 }}>
          Tous les magasins par dette
        </Eyebrow>
        <div style={{ padding: "0 22px" }}>
          {byDebt.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * i + 0.3, duration: 0.3 }}
            >
              <Pressable
                onClick={() => nav.go("storeProfile", { storeId: s.id })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom: i === byDebt.length - 1 ? "none" : `1px solid ${c.borderLight}`,
                }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: "linear-gradient(180deg, #1f1f1f 0%, #161616 100%)",
                    border: `1px solid ${c.borderLight}`,
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 600, color: c.white }}>{s.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 13, fontWeight: 500, color: c.white, marginBottom: 2 }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: 11, color: c.white40 }}>{s.area}</div>
                </div>
                <div className="flex items-center" style={{ gap: 6 }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: c.white,
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: -0.3,
                    }}
                  >
                    {fmt(s.debt)}
                  </span>
                  <span style={{ fontSize: 10, color: c.white40 }}>DA</span>
                  <ChevronRight size={13} color={c.white40} strokeWidth={2} />
                </div>
              </Pressable>
            </motion.div>
          ))}
        </div>
      </div>
    </StatusBg>
  );
}
