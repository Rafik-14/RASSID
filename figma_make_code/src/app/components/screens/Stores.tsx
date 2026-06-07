import { useState } from "react";
import { motion } from "motion/react";
import { c } from "../tokens";
import { StatusBg, NavBar, Pressable, ElevatedCard } from "../Chrome";
import { Search, Plus, SlidersHorizontal, ChevronRight } from "lucide-react";
import { MinimalTabBar } from "./Dashboard";
import { useNav } from "../nav";
import { STORES, fmt } from "../data";

type Filter = "all" | "alert" | "ok" | "paid";

export function Stores() {
  const nav = useNav();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = STORES.filter((s) => {
    const matchQuery =
      !query ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.area.toLowerCase().includes(query.toLowerCase());
    const matchFilter =
      filter === "all"
        ? true
        : filter === "alert"
        ? s.daysSincePayment >= 10
        : filter === "ok"
        ? s.debt > 0 && s.daysSincePayment < 10
        : s.debt === 0;
    return matchQuery && matchFilter;
  });

  const counts = {
    all: STORES.length,
    alert: STORES.filter((s) => s.daysSincePayment >= 10).length,
    ok: STORES.filter((s) => s.debt > 0 && s.daysSincePayment < 10).length,
    paid: STORES.filter((s) => s.debt === 0).length,
  };

  const filters: { id: Filter; l: string }[] = [
    { id: "all", l: "Tous" },
    { id: "alert", l: "Alerte" },
    { id: "ok", l: "À jour" },
    { id: "paid", l: "Soldés" },
  ];

  return (
    <StatusBg>
      <NavBar
        large={
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1
              style={{
                fontSize: 34,
                fontWeight: 600,
                color: c.white,
                letterSpacing: -1.6,
                marginBottom: 6,
                background: "linear-gradient(180deg, #ffffff 0%, #b8b8b8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Magasins
            </h1>
            <span style={{ fontSize: 13, color: c.white40 }}>
              {counts.all} actifs · <span style={{ color: c.amber }}>{counts.alert} en alerte</span>
            </span>
          </motion.div>
        }
      />
      <div className="absolute inset-0 overflow-y-auto" style={{ paddingTop: 200, paddingBottom: 95 }}>
        <div className="flex" style={{ padding: "0 22px 18px", gap: 8 }}>
          <div
            className="flex items-center flex-1"
            style={{
              gap: 10,
              padding: "11px 14px",
              background: "linear-gradient(180deg, #1d1d1d 0%, #161616 100%)",
              border: `1px solid ${c.borderLight}`,
              borderRadius: 14,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
          >
            <Search size={15} color={c.white40} strokeWidth={2} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un magasin…"
              style={{
                flex: 1,
                fontSize: 13,
                color: c.white,
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>
          <Pressable
            stretch={false}
            style={{
              width: 42,
              height: 42,
              background: "linear-gradient(180deg, #1d1d1d 0%, #161616 100%)",
              border: `1px solid ${c.borderLight}`,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SlidersHorizontal size={15} color={c.white} strokeWidth={2} />
          </Pressable>
        </div>

        <div
          className="flex"
          style={{
            margin: "0 22px 18px",
            padding: 4,
            background: "rgba(26,26,26,0.6)",
            border: `1px solid ${c.borderLight}`,
            borderRadius: 100,
            gap: 2,
            position: "relative",
          }}
        >
          {filters.map((p) => {
            const active = p.id === filter;
            return (
              <Pressable
                key={p.id}
                onClick={() => setFilter(p.id)}
                stretch={false}
                style={{
                  flex: 1,
                  position: "relative",
                  borderRadius: 100,
                }}
              >
                {active && (
                  <motion.div
                    layoutId="filterPill"
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
                  className="relative flex items-center justify-center"
                  style={{
                    gap: 6,
                    color: active ? c.ink : c.white,
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "7px 8px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.l}
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: active ? "rgba(0,0,0,0.45)" : c.white40,
                    }}
                  >
                    {counts[p.id]}
                  </span>
                </span>
              </Pressable>
            );
          })}
        </div>

        <div
          className="uppercase"
          style={{
            padding: "0 22px 10px",
            fontSize: 10,
            fontWeight: 600,
            color: c.white40,
            letterSpacing: 1.8,
          }}
        >
          {filtered.length} magasin{filtered.length > 1 ? "s" : ""}
        </div>

        <div style={{ padding: "0 22px" }}>
          {filtered.length === 0 && (
            <div style={{ padding: "32px 0", textAlign: "center", fontSize: 12, color: c.white40 }}>
              Aucun magasin trouvé
            </div>
          )}
          {filtered.map((s, i) => {
            const paid = s.debt === 0;
            const overdue = s.daysSincePayment >= 10;
            const dotColor = paid ? c.green : overdue ? c.red : c.amber;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i, duration: 0.3 }}
              >
                <Pressable
                  onClick={() => nav.go("storeProfile", { storeId: s.id })}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 0",
                    borderBottom: i === filtered.length - 1 ? "none" : `1px solid ${c.borderLight}`,
                  }}
                >
                  <div
                    className="relative flex items-center justify-center"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: "linear-gradient(180deg, #1f1f1f 0%, #161616 100%)",
                      border: `1px solid ${c.borderLight}`,
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: c.white }}>{s.initials}</span>
                    <div
                      style={{
                        position: "absolute",
                        top: -2,
                        right: -2,
                        width: 11,
                        height: 11,
                        borderRadius: 100,
                        background: dotColor,
                        border: `2.5px solid ${c.bg}`,
                        boxShadow: `0 0 8px ${dotColor}`,
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: c.white,
                        marginBottom: 2,
                        letterSpacing: -0.2,
                      }}
                    >
                      {s.name}
                    </div>
                    <div style={{ fontSize: 11, color: c.white40, fontVariantNumeric: "tabular-nums" }}>
                      {s.area} · {s.phone}
                      {overdue && (
                        <span style={{ color: c.red, marginLeft: 6 }}>
                          · {s.daysSincePayment}j
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center" style={{ gap: 6 }}>
                    <div className="flex flex-col items-end" style={{ gap: 2 }}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: paid ? c.green : c.white,
                          letterSpacing: -0.3,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {paid ? "Soldé" : fmt(s.debt)}
                      </span>
                      {!paid && <span style={{ fontSize: 10, color: c.white40 }}>DA</span>}
                    </div>
                    <ChevronRight size={13} color={c.white40} strokeWidth={2} />
                  </div>
                </Pressable>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Pressable
        stretch={false}
        onClick={() => nav.go("newStore")}
        style={{
          position: "absolute",
          right: 22,
          bottom: 110,
          height: 52,
          paddingLeft: 18,
          paddingRight: 22,
          gap: 8,
          borderRadius: 100,
          background: `linear-gradient(135deg, #9bff1f 0%, ${c.lime} 50%, #66c000 100%)`,
          boxShadow:
            "0 12px 32px rgba(127,227,0,0.5), 0 0 0 1px rgba(127,227,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 20,
        }}
      >
        <Plus size={18} color={c.ink} strokeWidth={2.8} />
        <span style={{ fontSize: 13, fontWeight: 700, color: c.ink, letterSpacing: -0.2 }}>
          Nouveau magasin
        </span>
      </Pressable>

      <MinimalTabBar active="stores" />
    </StatusBg>
  );
}
