import { motion } from "motion/react";
import { c } from "../tokens";
import { StatusBg, Eyebrow, Pressable, ElevatedCard, AnimatedNumber } from "../Chrome";
import { Banknote, Plus } from "lucide-react";
import { useNav } from "../nav";
import { MinimalTabBar } from "./Dashboard";

export function Payments() {
  const nav = useNav();
  return (
    <StatusBg>
      <div
        className="absolute left-0 right-0 z-30"
        style={{ top: 50, paddingLeft: 22, paddingRight: 22 }}
      >
        <div className="flex items-center" style={{ height: 36 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: c.white, letterSpacing: -0.2 }}>
            Paiements
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
            Paiements
          </h1>
          <p style={{ fontSize: 13, color: c.white40, lineHeight: 1.5, maxWidth: 280 }}>
            Enregistrez un encaissement depuis la fiche magasin ou via une nouvelle opération.
          </p>
        </motion.div>

        <div style={{ padding: "0 22px 24px" }}>
          <ElevatedCard glow="rgba(52,211,153,0.12)" style={{ padding: 18, borderRadius: 20 }}>
            <Eyebrow style={{ marginBottom: 12 }} dot={c.green}>
              Ce mois
            </Eyebrow>
            <div className="flex items-baseline" style={{ gap: 6, marginBottom: 6 }}>
              <AnimatedNumber
                value={96200}
                duration={1000}
                style={{
                  fontSize: 36,
                  fontWeight: 600,
                  color: c.green,
                  letterSpacing: -1.6,
                  fontVariantNumeric: "tabular-nums",
                  background: "linear-gradient(180deg, #34D399 0%, #1faa78 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              />
              <span style={{ fontSize: 14, color: c.white40, fontWeight: 500 }}>DA</span>
            </div>
            <span style={{ fontSize: 11, color: c.white40 }}>Encaissé</span>
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
                background: c.greenDim,
                border: "1px solid rgba(52,211,153,0.2)",
              }}
            >
              <Banknote size={20} color={c.green} strokeWidth={2.2} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.white, marginBottom: 4 }}>
              Aucun encaissement récent
            </div>
            <div style={{ fontSize: 11, color: c.white40, lineHeight: 1.5, marginBottom: 14 }}>
              Démarrez depuis un magasin ou créez<br />une opération directe.
            </div>
            <Pressable
              stretch={false}
              onClick={() => nav.go("newOperation", { opType: "pay" })}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 18px",
                background: `linear-gradient(135deg, #5fffb0 0%, ${c.green} 50%, #1faa78 100%)`,
                borderRadius: 100,
                boxShadow:
                  "0 8px 20px rgba(52,211,153,0.4), 0 0 0 1px rgba(52,211,153,0.25), inset 0 1px 0 rgba(255,255,255,0.4)",
              }}
            >
              <Plus size={14} color={c.ink} strokeWidth={3} />
              <span style={{ fontSize: 12, fontWeight: 700, color: c.ink, letterSpacing: -0.2 }}>
                Nouveau paiement
              </span>
            </Pressable>
          </div>
        </div>
      </div>

      <MinimalTabBar active="payments" />
    </StatusBg>
  );
}
