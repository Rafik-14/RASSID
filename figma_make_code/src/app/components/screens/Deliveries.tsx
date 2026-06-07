import { motion } from "motion/react";
import { c } from "../tokens";
import { StatusBg, Eyebrow, Pressable, ElevatedCard, AnimatedNumber } from "../Chrome";
import { Truck, Plus } from "lucide-react";
import { useNav } from "../nav";
import { MinimalTabBar } from "./Dashboard";

export function Deliveries() {
  const nav = useNav();
  return (
    <StatusBg>
      <div
        className="absolute left-0 right-0 z-30"
        style={{ top: 50, paddingLeft: 22, paddingRight: 22 }}
      >
        <div className="flex items-center" style={{ height: 36 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: c.white, letterSpacing: -0.2 }}>
            Livraisons
          </span>
        </div>
      </div>

      <div
        className="absolute inset-0 overflow-y-auto"
        style={{ paddingTop: 110, paddingBottom: 110 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ padding: "0 22px 26px" }}
        >
          <h1
            style={{
              fontSize: 38,
              fontWeight: 600,
              letterSpacing: -1.8,
              lineHeight: 1.05,
              marginBottom: 10,
              background: "linear-gradient(180deg, #ffffff 0%, #b8b8b8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Livraisons
          </h1>
          <p style={{ fontSize: 13, color: c.white40, lineHeight: 1.5, maxWidth: 280 }}>
            Enregistrez une livraison depuis la fiche magasin ou créez une nouvelle opération.
          </p>
        </motion.div>

        <div style={{ padding: "0 22px 24px" }}>
          <ElevatedCard glow="rgba(255,77,77,0.10)" style={{ padding: 18, borderRadius: 20 }}>
            <Eyebrow style={{ marginBottom: 12 }} dot={c.red}>
              Ce mois
            </Eyebrow>
            <div className="flex items-baseline" style={{ gap: 6, marginBottom: 6 }}>
              <AnimatedNumber
                value={184500}
                duration={1000}
                style={{
                  fontSize: 36,
                  fontWeight: 600,
                  color: c.white,
                  letterSpacing: -1.6,
                  fontVariantNumeric: "tabular-nums",
                  background: "linear-gradient(180deg, #ffffff 0%, #b8b8b8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              />
              <span style={{ fontSize: 14, color: c.white40, fontWeight: 500 }}>DA</span>
            </div>
            <span style={{ fontSize: 11, color: c.white40 }}>Marchandises livrées</span>
          </ElevatedCard>
        </div>

        <div style={{ padding: "0 22px" }}>
          <Eyebrow style={{ marginBottom: 14 }}>Comment commencer</Eyebrow>
          <div
            style={{
              padding: 18,
              borderRadius: 18,
              background: "linear-gradient(180deg, #1d1d1d 0%, #141414 100%)",
              border: `1px solid ${c.borderLight}`,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              textAlign: "center",
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                margin: "0 auto 14px",
                background: c.redDim,
                border: "1px solid rgba(255,77,77,0.2)",
              }}
            >
              <Truck size={20} color={c.red} strokeWidth={2.2} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.white, marginBottom: 4 }}>
              Aucune livraison récente
            </div>
            <div style={{ fontSize: 11, color: c.white40, lineHeight: 1.5, marginBottom: 14 }}>
              Démarrez depuis un magasin ou créez<br />une opération directe.
            </div>
            <Pressable
              stretch={false}
              onClick={() => nav.go("newOperation", { opType: "liv" })}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 18px",
                background: `linear-gradient(135deg, #9bff1f 0%, ${c.lime} 50%, #66c000 100%)`,
                borderRadius: 100,
                boxShadow:
                  "0 8px 20px rgba(127,227,0,0.4), 0 0 0 1px rgba(127,227,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4)",
              }}
            >
              <Plus size={14} color={c.ink} strokeWidth={3} />
              <span style={{ fontSize: 12, fontWeight: 700, color: c.ink, letterSpacing: -0.2 }}>
                Nouvelle livraison
              </span>
            </Pressable>
          </div>
        </div>
      </div>

      <MinimalTabBar active="deliveries" />
    </StatusBg>
  );
}
