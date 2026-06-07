import { useState } from "react";
import { motion } from "motion/react";
import { c } from "../tokens";
import { StatusBg, NavBar, Eyebrow, Pressable, AnimatedNumber } from "../Chrome";
import { Filter, ArrowDown, ArrowUp } from "lucide-react";

type FilterId = "all" | "liv" | "pay" | "ret";

const allTxs = [
  { date: "Aujourd'hui", sub: "1 juin 2026", debtDelta: "+8 500", type: "Livraison", filter: "liv", note: "BL-2026-0142 · 5 articles · Huile, Sucre", time: "14:22", amount: "+12 400", color: c.red },
  { date: "Aujourd'hui", sub: "1 juin 2026", debtDelta: "+8 500", type: "Paiement", filter: "pay", note: "Espèces · 3 billets de 1000 + 900", time: "10:08", amount: "−3 900", color: c.green },
  { date: "Hier", sub: "31 mai 2026", debtDelta: "−15 200", type: "Paiement", filter: "pay", note: "Virement bancaire · BNA", time: "09:45", amount: "−15 200", color: c.green },
  { date: "15 mai 2026", sub: "Il y a 17 jours", debtDelta: "+24 600", type: "Livraison", filter: "liv", note: "BL-2026-0138 · 8 articles", time: "16:30", amount: "+28 600", color: c.red },
  { date: "15 mai 2026", sub: "Il y a 17 jours", debtDelta: "+24 600", type: "Retour", filter: "ret", note: "Article défectueux · Conserve", time: "16:35", amount: "−4 000", color: c.blue },
];

export function HistoryScreen() {
  const [filter, setFilter] = useState<FilterId>("all");
  const filtered = allTxs.filter((t) => filter === "all" || t.filter === filter);

  const groups: Record<string, { sub: string; debtDelta: string; txs: typeof filtered }> = {};
  for (const t of filtered) {
    if (!groups[t.date]) groups[t.date] = { sub: t.sub, debtDelta: t.debtDelta, txs: [] };
    groups[t.date].txs.push(t);
  }

  const filters: { id: FilterId; l: string }[] = [
    { id: "all", l: "Tout" },
    { id: "liv", l: "Livraisons" },
    { id: "pay", l: "Paiements" },
    { id: "ret", l: "Retours" },
  ];

  return (
    <StatusBg>
      <NavBar
        back
        title="Historique"
        right={
          <Pressable
            stretch={false}
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
            }}
          >
            <Filter size={14} color={c.white} strokeWidth={2.2} />
          </Pressable>
        }
      />

      <div className="absolute inset-0 overflow-y-auto" style={{ paddingTop: 105, paddingBottom: 24 }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ padding: "0 22px 24px" }}
        >
          <Eyebrow style={{ marginBottom: 12 }} dot={c.lime}>
            Solde net du mois
          </Eyebrow>
          <div className="flex items-baseline" style={{ gap: 6, marginBottom: 18 }}>
            <span
              style={{
                fontSize: 46,
                fontWeight: 600,
                color: c.lime,
                letterSpacing: -2.2,
                lineHeight: 1,
              }}
            >
              +<AnimatedNumber value={18200} duration={900} style={{ fontVariantNumeric: "tabular-nums" }} />
            </span>
            <span style={{ fontSize: 16, color: c.white40, fontWeight: 500 }}>DA</span>
          </div>
          <div className="flex" style={{ gap: 14 }}>
            <div className="flex items-center" style={{ gap: 8 }}>
              <div
                className="flex items-center justify-center"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 100,
                  background: c.redDim,
                  border: "1px solid rgba(255,77,77,0.2)",
                }}
              >
                <ArrowUp size={11} color={c.red} strokeWidth={3} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: c.white40, letterSpacing: 0.3 }}>Sortant</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.white, fontVariantNumeric: "tabular-nums" }}>
                  41 000
                </div>
              </div>
            </div>
            <div className="flex items-center" style={{ gap: 8 }}>
              <div
                className="flex items-center justify-center"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 100,
                  background: c.greenDim,
                  border: "1px solid rgba(52,211,153,0.2)",
                }}
              >
                <ArrowDown size={11} color={c.green} strokeWidth={3} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: c.white40, letterSpacing: 0.3 }}>Entrant</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.white, fontVariantNumeric: "tabular-nums" }}>
                  23 200
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Animated filter pills */}
        <div
          className="flex"
          style={{
            margin: "0 22px 8px",
            padding: 4,
            background: "rgba(26,26,26,0.6)",
            border: `1px solid ${c.borderLight}`,
            borderRadius: 100,
            gap: 2,
            overflow: "hidden",
          }}
        >
          {filters.map((p) => {
            const active = p.id === filter;
            return (
              <Pressable
                key={p.id}
                onClick={() => setFilter(p.id)}
                stretch={false}
                style={{ flex: 1, position: "relative", borderRadius: 100 }}
              >
                {active && (
                  <motion.div
                    layoutId="historyFilter"
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: c.white,
                      borderRadius: 100,
                      boxShadow: "0 2px 8px rgba(255,255,255,0.12)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span
                  className="relative"
                  style={{
                    display: "block",
                    color: active ? c.ink : c.white,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "6px 4px",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.l}
                </span>
              </Pressable>
            );
          })}
        </div>

        {Object.entries(groups).map(([date, g], gi) => (
          <div key={gi} style={{ marginTop: 20 }}>
            <div className="flex items-center justify-between" style={{ padding: "10px 22px" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.white, letterSpacing: -0.2 }}>{date}</div>
                <div style={{ fontSize: 10, color: c.white40 }}>{g.sub}</div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: g.debtDelta.startsWith("+") ? c.red : c.green,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: -0.2,
                }}
              >
                {g.debtDelta} DA dette
              </span>
            </div>
            <div style={{ padding: "0 22px" }}>
              {g.txs.map((tx, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.3 }}
                  className="flex items-center"
                  style={{
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: i === g.txs.length - 1 ? "none" : `1px solid ${c.borderLight}`,
                  }}
                >
                  <div
                    style={{
                      width: 3,
                      height: 36,
                      borderRadius: 100,
                      background: tx.color,
                      boxShadow: `0 0 8px ${tx.color}80`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center" style={{ gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: c.white }}>{tx.type}</span>
                      <span style={{ fontSize: 10, color: c.white40 }}>· {tx.time}</span>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: c.white40,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tx.note}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: tx.color,
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: -0.3,
                    }}
                  >
                    {tx.amount}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: "32px 22px", textAlign: "center", fontSize: 12, color: c.white40 }}>
            Aucune opération
          </div>
        )}
      </div>
    </StatusBg>
  );
}
