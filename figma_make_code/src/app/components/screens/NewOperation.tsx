import { useState } from "react";
import { motion } from "motion/react";
import { c } from "../tokens";
import { StatusBg, NavBar, Eyebrow, Pressable, AnimatedNumber } from "../Chrome";
import { Car, Banknote, Undo2, Tag, ChevronRight, Check, Printer, Plus, Minus } from "lucide-react";
import { useNav } from "../nav";
import { findStore, fmt } from "../data";
import { toast } from "sonner";

type OpType = "liv" | "pay" | "ret" | "avo";

const types: { Icon: any; label: string; id: OpType; color: string }[] = [
  { Icon: Car, label: "Livraison", id: "liv", color: c.lime },
  { Icon: Banknote, label: "Paiement", id: "pay", color: c.green },
  { Icon: Undo2, label: "Retour", id: "ret", color: c.blue },
  { Icon: Tag, label: "Avoir", id: "avo", color: c.amber },
];

const initialArticles = [
  { name: "Huile Safia 5L", qty: 4, price: 1850 },
  { name: "Sucre Cristal 1Kg", qty: 12, price: 130 },
  { name: "Café Amor 250g", qty: 6, price: 480 },
];

export function NewOperation() {
  const nav = useNav();
  const [type, setType] = useState<OpType>(nav.state.opType || "liv");
  const [articles, setArticles] = useState(initialArticles);
  const [paymentAmount, setPaymentAmount] = useState(10000);

  const store = findStore(nav.state.storeId);
  const isLiv = type === "liv";
  const total = isLiv ? articles.reduce((s, a) => s + a.qty * a.price, 0) : paymentAmount;
  const activeType = types.find((t) => t.id === type)!;

  const updateQty = (idx: number, delta: number) => {
    setArticles((prev) => prev.map((a, i) => (i === idx ? { ...a, qty: Math.max(0, a.qty + delta) } : a)));
  };

  const confirm = () => {
    const labels: Record<OpType, string> = {
      liv: "Livraison enregistrée",
      pay: "Paiement encaissé",
      ret: "Retour enregistré",
      avo: "Avoir crédité",
    };
    toast.success(labels[type], { description: `${fmt(total)} DA · ${store.name}` });
    nav.back();
  };

  return (
    <StatusBg>
      <NavBar back title="Opération" />

      <div className="absolute inset-0 overflow-y-auto" style={{ paddingTop: 105, paddingBottom: 100 }}>
        {/* Animated segmented control */}
        <div style={{ padding: "0 22px 28px" }}>
          <div
            className="flex relative"
            style={{
              padding: 4,
              background: "rgba(26,26,26,0.7)",
              border: `1px solid ${c.borderLight}`,
              borderRadius: 14,
              gap: 2,
            }}
          >
            {types.map((t) => {
              const active = t.id === type;
              return (
                <Pressable
                  key={t.id}
                  onClick={() => setType(t.id)}
                  stretch={false}
                  style={{ flex: 1, position: "relative", borderRadius: 10 }}
                >
                  {active && (
                    <motion.div
                      layoutId="opType"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: `linear-gradient(135deg, ${t.color} 0%, ${t.color}cc 100%)`,
                        borderRadius: 10,
                        boxShadow: `0 4px 16px ${t.color}60, inset 0 1px 0 rgba(255,255,255,0.3)`,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <div
                    className="relative flex flex-col items-center justify-center"
                    style={{ padding: "10px 6px", gap: 4 }}
                  >
                    <t.Icon size={15} color={active ? c.ink : c.white40} strokeWidth={2.4} />
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: active ? c.ink : c.white40 }}>
                      {t.label}
                    </span>
                  </div>
                </Pressable>
              );
            })}
          </div>
        </div>

        {/* Animated total hero */}
        <motion.div
          key={type}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          style={{ padding: "0 22px 32px", textAlign: "center", position: "relative" }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -20,
              left: "50%",
              transform: "translateX(-50%)",
              width: 280,
              height: 140,
              borderRadius: "50%",
              background: `radial-gradient(ellipse, ${activeType.color}25 0%, transparent 65%)`,
              filter: "blur(20px)",
              pointerEvents: "none",
            }}
          />
          <Eyebrow style={{ marginBottom: 14, justifyContent: "center" }} dot={activeType.color}>
            Montant total
          </Eyebrow>
          <div className="flex items-baseline justify-center relative" style={{ gap: 6 }}>
            <AnimatedNumber
              value={total}
              duration={500}
              style={{
                fontSize: 60,
                fontWeight: 600,
                letterSpacing: -3,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                background: `linear-gradient(180deg, ${activeType.color} 0%, ${activeType.color}aa 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                transition: "color 200ms ease",
              }}
            />
            <span style={{ fontSize: 18, color: c.white40, fontWeight: 500 }}>DA</span>
          </div>
        </motion.div>

        <div style={{ padding: "0 22px 20px" }}>
          <Eyebrow style={{ marginBottom: 10 }}>Magasin</Eyebrow>
          <Pressable
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              background: "linear-gradient(180deg, #1d1d1d 0%, #161616 100%)",
              border: `1px solid ${c.borderLight}`,
              borderRadius: 14,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "linear-gradient(135deg, #2a2a2a 0%, #161616 100%)",
                border: `1px solid ${c.borderLight}`,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: c.white }}>{store.initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: 13, fontWeight: 500, color: c.white }}>{store.name}</div>
              <div style={{ fontSize: 11, color: store.debt > 0 ? c.red : c.green }}>
                {store.debt > 0 ? `Dette ${fmt(store.debt)} DA` : "Soldé"}
              </div>
            </div>
            <ChevronRight size={14} color={c.white40} />
          </Pressable>
        </div>

        {isLiv ? (
          <div style={{ padding: "0 22px" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
              <Eyebrow>Articles ({articles.length})</Eyebrow>
              <div className="flex items-center" style={{ gap: 4, fontSize: 11, fontWeight: 600, color: c.lime }}>
                <Plus size={11} strokeWidth={2.5} />
                Ajouter
              </div>
            </div>
            <div
              style={{
                background: "linear-gradient(180deg, #1d1d1d 0%, #141414 100%)",
                border: `1px solid ${c.borderLight}`,
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              {articles.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center"
                  style={{
                    gap: 12,
                    padding: "13px 14px",
                    borderBottom: i === articles.length - 1 ? "none" : `1px solid ${c.borderLight}`,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: c.white, marginBottom: 2 }}>
                      {a.name}
                    </div>
                    <div style={{ fontSize: 10, color: c.white40, fontVariantNumeric: "tabular-nums" }}>
                      {fmt(a.price)} DA / unité
                    </div>
                  </div>
                  <div
                    className="flex items-center"
                    style={{
                      gap: 0,
                      background: "#0e0e0e",
                      border: `1px solid ${c.borderLight}`,
                      borderRadius: 100,
                      padding: 2,
                    }}
                  >
                    <Pressable
                      onClick={() => updateQty(i, -1)}
                      stretch={false}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 100,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Minus size={11} color={a.qty === 0 ? c.white40 : c.white} strokeWidth={2.5} />
                    </Pressable>
                    <motion.span
                      key={a.qty}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: c.white,
                        minWidth: 24,
                        textAlign: "center",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {a.qty}
                    </motion.span>
                    <Pressable
                      onClick={() => updateQty(i, 1)}
                      stretch={false}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 100,
                        background: `linear-gradient(135deg, #9bff1f 0%, ${c.lime} 100%)`,
                        boxShadow: "0 2px 8px rgba(127,227,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Plus size={11} color={c.ink} strokeWidth={3} />
                    </Pressable>
                  </div>
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: c.white,
                      minWidth: 56,
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {fmt(a.qty * a.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding: "0 22px" }}>
            <Eyebrow style={{ marginBottom: 10 }}>Montant en DA</Eyebrow>
            <div
              style={{
                background: "linear-gradient(180deg, #1d1d1d 0%, #141414 100%)",
                border: `1px solid ${c.borderLight}`,
                borderRadius: 16,
                padding: "14px 16px",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value) || 0)}
                style={{
                  width: "100%",
                  fontSize: 22,
                  fontWeight: 600,
                  color: c.white,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontFamily: "inherit",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: -0.5,
                }}
              />
            </div>
            <div className="flex" style={{ gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              {[5000, 10000, 20000, 50000].map((v) => {
                const active = paymentAmount === v;
                return (
                  <Pressable
                    key={v}
                    onClick={() => setPaymentAmount(v)}
                    stretch={false}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: active ? c.ink : c.white,
                      padding: "7px 14px",
                      borderRadius: 100,
                      background: active ? c.white : "linear-gradient(180deg, #1d1d1d 0%, #161616 100%)",
                      border: active ? "none" : `1px solid ${c.borderLight}`,
                    }}
                  >
                    {fmt(v)} DA
                  </Pressable>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom action dock */}
      <div
        className="absolute z-30 flex"
        style={{
          left: 0,
          right: 0,
          bottom: 0,
          paddingTop: 32,
          paddingBottom: 30,
          paddingLeft: 16,
          paddingRight: 16,
          gap: 8,
          background: "linear-gradient(180deg, transparent 0%, rgba(10,10,10,0.85) 30%, #0A0A0A 60%)",
          backdropFilter: "blur(8px)",
        }}
      >
        {isLiv && (
          <Pressable
            stretch={false}
            style={{
              background: "linear-gradient(180deg, #1d1d1d 0%, #161616 100%)",
              border: `1px solid ${c.borderLight}`,
              borderRadius: 16,
              padding: "14px 18px",
              gap: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <Printer size={15} color={c.white} strokeWidth={2.2} />
            <span style={{ fontSize: 12, fontWeight: 600, color: c.white }}>BL</span>
          </Pressable>
        )}
        <Pressable
          onClick={confirm}
          style={{
            flex: 1,
            background: `linear-gradient(135deg, ${activeType.color}ee 0%, ${activeType.color} 50%, ${activeType.color}cc 100%)`,
            borderRadius: 16,
            padding: "14px 16px",
            gap: 8,
            boxShadow: `0 12px 28px ${activeType.color}60, 0 0 0 1px ${activeType.color}40, inset 0 1px 0 rgba(255,255,255,0.4)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check size={16} color={c.ink} strokeWidth={3} />
          <span style={{ fontSize: 13, fontWeight: 700, color: c.ink, letterSpacing: -0.2 }}>
            Confirmer {activeType.label.toLowerCase()}
          </span>
        </Pressable>
      </div>
    </StatusBg>
  );
}
