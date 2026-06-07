import { motion } from "motion/react";
import { c } from "../tokens";
import { StatusBg, Eyebrow, Pressable, ElevatedCard, AnimatedNumber } from "../Chrome";
import { Bell, Plus, Home, Truck, Banknote, Store as StoreIcon, ArrowUpRight, ChevronRight, RefreshCw, Phone } from "lucide-react";
import { useNav, Screen } from "../nav";
import { STORES, REP_NAME, PENDING_SYNC, fmt } from "../data";

const totalDebt = STORES.reduce((s, x) => s + x.debt, 0);
const collectedToday = 12400;
const overdueCount = STORES.filter((s) => s.daysSincePayment >= 10).length;
const monthDeliveries = 184500;
const monthPayments = 96200;

function MiniBars({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end" style={{ height: 38, gap: 3, marginTop: 10 }}>
      {data.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ duration: 0.6, delay: 0.05 * i + 0.2, ease: [0.32, 0.72, 0, 1] }}
          style={{
            flex: 1,
            background:
              i === data.length - 1
                ? `linear-gradient(180deg, ${color} 0%, ${color}aa 100%)`
                : `linear-gradient(180deg, ${color}66 0%, ${color}22 100%)`,
            borderRadius: 3,
            boxShadow: i === data.length - 1 ? `0 0 8px ${color}80` : "none",
          }}
        />
      ))}
    </div>
  );
}

export function Dashboard() {
  const nav = useNav();
  const route = STORES.slice(0, 4);

  return (
    <StatusBg>
      {/* Top header */}
      <div
        className="absolute left-0 right-0 z-30 flex items-center justify-between"
        style={{ top: 50, paddingLeft: 22, paddingRight: 22, height: 36 }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: 100,
            background: `linear-gradient(135deg, ${c.lime} 0%, #5fc000 100%)`,
            boxShadow: "0 4px 14px rgba(127,227,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: c.ink }}>AM</span>
        </div>
        <Pressable
          stretch={false}
          onClick={() => nav.go("overdueAlerts")}
          style={{
            width: 36,
            height: 36,
            borderRadius: 100,
            background: "linear-gradient(180deg, #1f1f1f 0%, #161616 100%)",
            border: `1px solid ${c.borderLight}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <Bell size={15} color={c.white} strokeWidth={2} />
          <motion.div
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 7,
              height: 7,
              borderRadius: 100,
              background: c.red,
              boxShadow: `0 0 8px ${c.red}`,
            }}
          />
        </Pressable>
      </div>

      <div className="absolute inset-0 overflow-y-auto" style={{ paddingTop: 100, paddingBottom: 100 }}>
        {/* Greeting + sync badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ padding: "0 22px 22px" }}
        >
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: -1.2,
              lineHeight: 1.05,
              marginBottom: 4,
              background: "linear-gradient(180deg, #ffffff 0%, #b8b8b8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Bonjour, {REP_NAME.split(" ")[0]}
          </h1>
          <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
            <span style={{ fontSize: 13, color: c.white40 }}>Voici votre résumé</span>
            <div
              className="flex items-center"
              style={{
                gap: 6,
                padding: "4px 10px",
                borderRadius: 100,
                background: PENDING_SYNC > 0 ? c.amberDim : c.greenDim,
                border: `1px solid ${PENDING_SYNC > 0 ? "rgba(251,191,36,0.2)" : "rgba(52,211,153,0.2)"}`,
              }}
            >
              <motion.div
                animate={PENDING_SYNC > 0 ? { rotate: 360 } : {}}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                style={{ display: "flex" }}
              >
                <RefreshCw size={10} color={PENDING_SYNC > 0 ? c.amber : c.green} strokeWidth={2.5} />
              </motion.div>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: PENDING_SYNC > 0 ? c.amber : c.green }}>
                {PENDING_SYNC > 0 ? `${PENDING_SYNC} en attente` : "Synchronisé"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* KPI Bento */}
        <div style={{ padding: "0 22px 26px" }}>
          <div className="flex" style={{ gap: 10 }}>
            <Pressable
              onClick={() => nav.go("overdueAlerts")}
              style={{ flex: 1.4 }}
            >
              <ElevatedCard glow="rgba(255,77,77,0.14)" style={{ padding: 16, borderRadius: 18 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                  <Eyebrow style={{ fontSize: 9 }} dot={c.red}>
                    Créances
                  </Eyebrow>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      color: c.red,
                      padding: "2px 7px",
                      borderRadius: 100,
                      background: c.redDim,
                      border: "1px solid rgba(255,77,77,0.2)",
                      letterSpacing: 0.2,
                    }}
                  >
                    Dette active
                  </span>
                </div>
                <div className="flex items-baseline" style={{ gap: 4 }}>
                  <AnimatedNumber
                    value={totalDebt}
                    duration={1100}
                    style={{
                      fontSize: 26,
                      fontWeight: 600,
                      color: c.white,
                      letterSpacing: -1,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  />
                  <span style={{ fontSize: 11, color: c.white40, fontWeight: 500 }}>DA</span>
                </div>
              </ElevatedCard>
            </Pressable>
          </div>
          <div className="flex" style={{ gap: 10, marginTop: 10 }}>
            <Pressable onClick={() => nav.setTab("stores")} style={{ flex: 1 }}>
              <ElevatedCard style={{ padding: 14, borderRadius: 18 }}>
                <Eyebrow style={{ fontSize: 9, marginBottom: 8 }} dot={c.amber}>
                  Magasins
                </Eyebrow>
                <div className="flex items-baseline" style={{ gap: 4 }}>
                  <AnimatedNumber
                    value={STORES.length}
                    duration={700}
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      color: c.white,
                      letterSpacing: -0.6,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  />
                </div>
                <div style={{ fontSize: 10, color: c.amber, marginTop: 3, fontWeight: 500 }}>
                  {overdueCount} en alerte
                </div>
              </ElevatedCard>
            </Pressable>
            <Pressable onClick={() => nav.setTab("payments")} style={{ flex: 1 }}>
              <ElevatedCard glow="rgba(52,211,153,0.10)" style={{ padding: 14, borderRadius: 18 }}>
                <Eyebrow style={{ fontSize: 9, marginBottom: 8 }} dot={c.green}>
                  Encaissé
                </Eyebrow>
                <div className="flex items-baseline" style={{ gap: 4 }}>
                  <AnimatedNumber
                    value={collectedToday}
                    duration={900}
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      color: c.green,
                      letterSpacing: -0.6,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  />
                  <span style={{ fontSize: 10, color: c.white40, fontWeight: 500 }}>DA</span>
                </div>
                <div style={{ fontSize: 10, color: c.white40, marginTop: 3 }}>Aujourd'hui</div>
              </ElevatedCard>
            </Pressable>
          </div>
        </div>

        {/* ACTIVITÉ */}
        <div style={{ padding: "0 22px 8px" }}>
          <Eyebrow style={{ marginBottom: 12 }}>Activité</Eyebrow>
        </div>
        <div style={{ padding: "0 22px 24px" }}>
          <div className="flex" style={{ gap: 10 }}>
            <Pressable onClick={() => nav.setTab("deliveries")} style={{ flex: 1 }}>
              <ElevatedCard style={{ padding: 14, borderRadius: 18 }}>
                <div className="flex items-center" style={{ gap: 6, marginBottom: 4 }}>
                  <Truck size={11} color={c.red} strokeWidth={2.4} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: c.white40, letterSpacing: 1.5 }}>
                    LIVRAISONS
                  </span>
                </div>
                <div style={{ fontSize: 10, color: c.white40, marginBottom: 6 }}>
                  marchandises livrées ce mois
                </div>
                <div className="flex items-baseline" style={{ gap: 4 }}>
                  <AnimatedNumber
                    value={monthDeliveries}
                    duration={1000}
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: c.white,
                      letterSpacing: -0.5,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  />
                  <span style={{ fontSize: 10, color: c.white40, fontWeight: 500 }}>DA</span>
                </div>
                <MiniBars data={[40, 52, 38, 60, 48, 70, 65]} color={c.red} />
              </ElevatedCard>
            </Pressable>
            <Pressable onClick={() => nav.setTab("payments")} style={{ flex: 1 }}>
              <ElevatedCard style={{ padding: 14, borderRadius: 18 }}>
                <div className="flex items-center" style={{ gap: 6, marginBottom: 4 }}>
                  <Banknote size={11} color={c.green} strokeWidth={2.4} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: c.white40, letterSpacing: 1.5 }}>
                    PAIEMENTS REÇUS
                  </span>
                </div>
                <div style={{ fontSize: 10, color: c.white40, marginBottom: 6 }}>
                  encaissé ce mois
                </div>
                <div className="flex items-baseline" style={{ gap: 4 }}>
                  <AnimatedNumber
                    value={monthPayments}
                    duration={1000}
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: c.green,
                      letterSpacing: -0.5,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  />
                  <span style={{ fontSize: 10, color: c.white40, fontWeight: 500 }}>DA</span>
                </div>
                <MiniBars data={[20, 32, 28, 36, 40, 48, 52]} color={c.green} />
              </ElevatedCard>
            </Pressable>
          </div>
        </div>

        {/* ALERTES */}
        {overdueCount > 0 && (
          <div style={{ padding: "0 22px 24px" }}>
            <Eyebrow style={{ marginBottom: 12 }}>Alertes</Eyebrow>
            <Pressable onClick={() => nav.go("overdueAlerts")}>
              <ElevatedCard glow="rgba(255,77,77,0.14)" style={{ padding: 14, borderRadius: 16 }}>
                <div className="flex items-center" style={{ gap: 12 }}>
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: c.redDim,
                      border: "1px solid rgba(255,77,77,0.2)",
                    }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 700, color: c.red }}>!</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 13, fontWeight: 500, color: c.white }}>
                      Voir les impayés
                    </div>
                    <div style={{ fontSize: 11, color: c.red, fontWeight: 500 }}>
                      {overdueCount} magasin{overdueCount > 1 ? "s" : ""} · plus de 10 jours
                    </div>
                  </div>
                  <ChevronRight size={14} color={c.white40} />
                </div>
              </ElevatedCard>
            </Pressable>
          </div>
        )}

        {/* ROUTE DU JOUR */}
        <div className="flex items-center justify-between" style={{ padding: "0 22px 12px" }}>
          <Eyebrow>Route du jour</Eyebrow>
          <span style={{ fontSize: 11, color: c.white40 }}>{route.length} arrêts</span>
        </div>

        <div style={{ padding: "0 22px" }}>
          {route.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i + 0.2, duration: 0.35 }}
            >
              <Pressable
                onClick={() => nav.go("storeProfile", { storeId: s.id })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom: i === route.length - 1 ? "none" : `1px solid ${c.borderLight}`,
                }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 100,
                    background: "linear-gradient(180deg, #1f1f1f 0%, #161616 100%)",
                    border: `1px solid ${c.borderLight}`,
                    fontSize: 10,
                    fontWeight: 700,
                    color: c.white40,
                  }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 13, fontWeight: 500, color: c.white, marginBottom: 1 }}>
                    {s.name}
                  </div>
                  <div className="flex items-center" style={{ gap: 6, fontSize: 11, color: c.white40 }}>
                    <span>{s.area}</span>
                    <div style={{ width: 3, height: 3, borderRadius: 100, background: c.white40 }} />
                    <Phone size={9} color={c.white40} strokeWidth={2.5} />
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{s.phone}</span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: s.debt > 0 ? c.white : c.green,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {s.debt > 0 ? fmt(s.debt) : "Soldé"}
                </span>
              </Pressable>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <div
        style={{
          position: "absolute",
          right: 22,
          bottom: 110,
          zIndex: 20,
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          style={{
            position: "absolute",
            inset: -8,
            borderRadius: 100,
            background: c.lime,
            filter: "blur(8px)",
            zIndex: -1,
          }}
        />
        <Pressable
          stretch={false}
          onClick={() => nav.go("newOperation")}
          style={{
            width: 56,
            height: 56,
            borderRadius: 100,
            background: `linear-gradient(135deg, #9bff1f 0%, ${c.lime} 50%, #66c000 100%)`,
            boxShadow: "0 12px 32px rgba(127,227,0,0.5), 0 0 0 1px rgba(127,227,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus size={24} color={c.ink} strokeWidth={2.8} />
        </Pressable>
      </div>

      <MinimalTabBar active="dashboard" />
    </StatusBg>
  );
}

export function MinimalTabBar({ active }: { active: Screen }) {
  const nav = useNav();
  const tabs: { id: Screen; Icon: any; label: string }[] = [
    { id: "dashboard", Icon: Home, label: "Accueil" },
    { id: "deliveries", Icon: Truck, label: "Livraisons" },
    { id: "payments", Icon: Banknote, label: "Paiements" },
    { id: "stores", Icon: StoreIcon, label: "Magasins" },
  ];
  return (
    <div
      className="absolute z-30 flex"
      style={{
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 14,
        paddingBottom: 28,
        background:
          "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.85) 35%, #0A0A0A 70%)",
        backdropFilter: "blur(12px)",
      }}
    >
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <Pressable
            key={t.id}
            onClick={() => nav.setTab(t.id)}
            stretch={false}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              position: "relative",
            }}
          >
            <t.Icon
              size={20}
              color={isActive ? c.white : c.white40}
              strokeWidth={isActive ? 2.4 : 1.8}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? c.white : c.white40,
              }}
            >
              {t.label}
            </span>
            <div style={{ height: 4, position: "relative", width: "100%" }}>
              {isActive && (
                <motion.div
                  layoutId="tabDot"
                  style={{
                    position: "absolute",
                    left: "50%",
                    marginLeft: -2,
                    width: 4,
                    height: 4,
                    borderRadius: 100,
                    background: c.lime,
                    boxShadow: `0 0 8px ${c.lime}`,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </div>
          </Pressable>
        );
      })}
    </div>
  );
}
