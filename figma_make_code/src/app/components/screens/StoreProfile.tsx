import { motion } from "motion/react";
import { c } from "../tokens";
import { StatusBg, NavBar, Pressable, ElevatedCard, AnimatedNumber, Eyebrow } from "../Chrome";
import {
  MoreHorizontal,
  Phone,
  MapPin,
  MessageCircle,
  Car,
  Banknote,
  Undo2,
  Tag,
  ArrowUpRight,
} from "lucide-react";
import { useNav } from "../nav";
import { findStore, fmt } from "../data";

function InfoRow({ label, value, color, last }: { label: string; value: string; color?: string; last?: boolean }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: "12px 16px",
        borderBottom: last ? "none" : `1px solid ${c.borderLight}`,
      }}
    >
      <span style={{ fontSize: 12, color: c.white40 }}>{label}</span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: color || c.white,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: -0.2,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function StoreProfile() {
  const nav = useNav();
  const store = findStore(nav.state.storeId);
  const isPositive = store.debt > 0;

  const opBtn = (Icon: any, label: string, type: "liv" | "pay" | "ret" | "avo") => (
    <Pressable
      onClick={() => nav.go("newOperation", { storeId: store.id, opType: type })}
      style={{
        flex: 1,
        background: "linear-gradient(180deg, #1f1f1f 0%, #161616 100%)",
        border: `1px solid ${c.borderLight}`,
        borderRadius: 16,
        padding: "10px 4px",
        gap: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <Icon size={15} color={c.white} strokeWidth={2} />
      <span style={{ fontSize: 10, fontWeight: 500, color: c.white }}>{label}</span>
    </Pressable>
  );

  return (
    <StatusBg>
      <NavBar
        back
        title={store.name}
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
            <MoreHorizontal size={16} color={c.white} strokeWidth={2} />
          </Pressable>
        }
      />

      <div className="absolute inset-0 overflow-y-auto" style={{ paddingTop: 105, paddingBottom: 110 }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ padding: "0 22px 24px" }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              background: "linear-gradient(135deg, #2a2a2a 0%, #161616 100%)",
              border: `1px solid ${c.borderLight}`,
              marginBottom: 16,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <span style={{ fontSize: 19, fontWeight: 700, color: c.white }}>{store.initials}</span>
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: c.white,
              letterSpacing: -1.2,
              marginBottom: 4,
              background: "linear-gradient(180deg, #ffffff 0%, #b8b8b8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {store.name}
          </h1>
          <div className="flex items-center" style={{ gap: 8, marginBottom: 18 }}>
            <span style={{ fontSize: 12, color: c.white40 }}>{store.area}</span>
            <div style={{ width: 3, height: 3, borderRadius: 100, background: c.white40 }} />
            <span style={{ fontSize: 12, color: c.white40 }}>{store.manager}</span>
          </div>

          <div className="flex" style={{ gap: 8 }}>
            {[
              { Icon: Phone, label: "Appeler" },
              { Icon: MessageCircle, label: "Message" },
              { Icon: MapPin, label: "Itinéraire" },
            ].map((b) => (
              <Pressable
                key={b.label}
                style={{
                  flex: 1,
                  gap: 6,
                  padding: "10px 12px",
                  background: "linear-gradient(180deg, #1d1d1d 0%, #161616 100%)",
                  border: `1px solid ${c.borderLight}`,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                }}
              >
                <b.Icon size={13} color={c.white} strokeWidth={2.2} />
                <span style={{ fontSize: 12, fontWeight: 500, color: c.white }}>{b.label}</span>
              </Pressable>
            ))}
          </div>
        </motion.div>

        {/* Hero balance card */}
        <div style={{ margin: "0 22px 24px" }}>
          <ElevatedCard
            glow={isPositive ? "rgba(255,77,77,0.20)" : "rgba(52,211,153,0.20)"}
            style={{ padding: 22, borderRadius: 22 }}
          >
            <Eyebrow style={{ marginBottom: 12 }} dot={isPositive ? c.red : c.green}>
              {isPositive ? "Doit au distributeur" : "Compte soldé"}
            </Eyebrow>
            <div className="flex items-baseline" style={{ gap: 6 }}>
              <AnimatedNumber
                value={store.debt}
                duration={900}
                style={{
                  fontSize: 44,
                  fontWeight: 600,
                  color: c.white,
                  letterSpacing: -2,
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                  background: isPositive
                    ? "linear-gradient(180deg, #ffffff 0%, #b8b8b8 100%)"
                    : "linear-gradient(180deg, #34D399 0%, #1faa78 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              />
              <span style={{ fontSize: 16, color: c.white40, fontWeight: 500 }}>DA</span>
            </div>
          </ElevatedCard>
        </div>

        {/* INFORMATIONS */}
        <div style={{ padding: "0 22px 12px" }}>
          <Eyebrow style={{ marginBottom: 12 }}>Informations</Eyebrow>
        </div>
        <div style={{ padding: "0 22px 18px" }}>
          <div
            style={{
              background: "linear-gradient(180deg, #1d1d1d 0%, #141414 100%)",
              border: `1px solid ${c.borderLight}`,
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <InfoRow label="Gérant" value={store.manager} />
            <InfoRow label="Téléphone" value={store.phone} />
            <InfoRow label="Quartier" value={store.area} />
            <InfoRow
              label="Dette actuelle"
              value={store.debt > 0 ? `${fmt(store.debt)} DA` : "—"}
              color={store.debt > 0 ? c.red : c.green}
            />
            <InfoRow label="Total livré" value={`${fmt(store.totalDelivered)} DA`} />
            <InfoRow label="Total encaissé" value={`${fmt(store.totalCollected)} DA`} color={c.green} />
            <InfoRow label="Dernière livraison" value={store.lastDelivery} />
            <InfoRow label="Dernier paiement" value={store.lastPayment} last />
          </div>
        </div>

        <div style={{ padding: "0 22px" }}>
          <Pressable
            onClick={() => nav.go("history", { storeId: store.id })}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              background: "linear-gradient(180deg, #1d1d1d 0%, #141414 100%)",
              border: `1px solid ${c.borderLight}`,
              borderRadius: 16,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500, color: c.white }}>
              Historique des opérations
            </span>
            <ArrowUpRight size={14} color={c.lime} strokeWidth={2.5} />
          </Pressable>
        </div>
      </div>

      {/* Action dock */}
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
        <Pressable
          onClick={() => nav.go("newOperation", { storeId: store.id, opType: "liv" })}
          style={{
            flex: 1.4,
            background: `linear-gradient(135deg, #9bff1f 0%, ${c.lime} 50%, #66c000 100%)`,
            borderRadius: 16,
            padding: "14px 12px",
            gap: 8,
            boxShadow:
              "0 12px 28px rgba(127,227,0,0.4), 0 0 0 1px rgba(127,227,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Car size={16} color={c.ink} strokeWidth={2.5} />
          <span style={{ fontSize: 13, fontWeight: 700, color: c.ink, letterSpacing: -0.2 }}>
            Livraison
          </span>
        </Pressable>
        {opBtn(Banknote, "Paiement", "pay")}
        {opBtn(Undo2, "Retour", "ret")}
        {opBtn(Tag, "Avoir", "avo")}
      </div>
    </StatusBg>
  );
}
