import { motion, AnimatePresence } from "motion/react";
import { Toaster } from "sonner";
import { PhoneFrame } from "./components/PhoneFrame";
import { NavProvider, useNav, Screen } from "./components/nav";
import { Dashboard } from "./components/screens/Dashboard";
import { Stores } from "./components/screens/Stores";
import { StoreProfile } from "./components/screens/StoreProfile";
import { HistoryScreen } from "./components/screens/History";
import { NewOperation } from "./components/screens/NewOperation";
import { NewStore } from "./components/screens/NewStore";
import { OverdueAlerts } from "./components/screens/OverdueAlerts";
import { Deliveries } from "./components/screens/Deliveries";
import { Payments } from "./components/screens/Payments";

const screenMap: Record<Screen, () => JSX.Element> = {
  dashboard: Dashboard,
  stores: Stores,
  storeProfile: StoreProfile,
  history: HistoryScreen,
  newOperation: NewOperation,
  newStore: NewStore,
  overdueAlerts: OverdueAlerts,
  deliveries: Deliveries,
  payments: Payments,
};

function PhoneScreen() {
  const nav = useNav();
  const Screen = screenMap[nav.state.screen];
  const key = nav.stack.length + "-" + nav.state.screen + "-" + (nav.state.storeId || "");
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={key}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Screen />
      </motion.div>
    </AnimatePresence>
  );
}

function ResetButton() {
  const nav = useNav();
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => nav.setTab("dashboard")}
      className="cursor-pointer"
      style={{
        background: "rgba(240,240,240,0.05)",
        border: "1px solid rgba(240,240,240,0.1)",
        color: "#F0F0F0",
        fontSize: 12,
        fontWeight: 500,
        padding: "10px 18px",
        borderRadius: 100,
        fontFamily: "Inter, sans-serif",
        letterSpacing: -0.1,
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      ↺ Recommencer
    </motion.button>
  );
}

function Shell() {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center"
      style={{
        background: "#050505",
        fontFamily: "Inter, sans-serif",
        color: "#F0F0F0",
        padding: "56px 24px 64px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glows */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(127,227,0,0.06) 0%, transparent 60%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: -300,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,77,77,0.04) 0%, transparent 60%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      {/* Grain */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.06,
          mixBlendMode: "overlay",
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          maxWidth: 720,
          width: "100%",
          textAlign: "center",
          marginBottom: 40,
          position: "relative",
        }}
      >
        <div
          className="inline-flex items-center"
          style={{
            gap: 8,
            fontSize: 10,
            fontWeight: 600,
            color: "rgba(240,240,240,0.6)",
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 18,
            padding: "6px 14px",
            borderRadius: 100,
            background: "rgba(240,240,240,0.04)",
            border: "1px solid rgba(240,240,240,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            style={{
              width: 6,
              height: 6,
              borderRadius: 100,
              background: "#7FE300",
              boxShadow: "0 0 8px #7FE300",
            }}
          />
          Prototype interactif · v3
        </div>
        <h1
          style={{
            fontSize: 56,
            fontWeight: 600,
            letterSpacing: -2.8,
            lineHeight: 0.95,
            marginBottom: 16,
            background: "linear-gradient(180deg, #ffffff 0%, #888888 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Rassid<span style={{ color: "#7FE300", WebkitTextFillColor: "#7FE300" }}>.</span>
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "rgba(240,240,240,0.55)",
            lineHeight: 1.55,
            maxWidth: 460,
            margin: "0 auto",
            letterSpacing: -0.1,
          }}
        >
          Tapez sur un magasin, changez d'onglet, créez une opération.
          <br />
          Tout est cliquable.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
        style={{ position: "relative", marginBottom: 32 }}
      >
        <PhoneFrame>
          <PhoneScreen />
        </PhoneFrame>
      </motion.div>

      <ResetButton />

      <div
        style={{
          marginTop: 48,
          fontSize: 10,
          color: "rgba(240,240,240,0.35)",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          fontFamily: "monospace",
        }}
      >
        #0A0A0A · #7FE300 · Inter
      </div>
    </div>
  );
}

export default function App() {
  return (
    <NavProvider>
      <Shell />
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: "linear-gradient(180deg, #1f1f1f 0%, #161616 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#F0F0F0",
            fontFamily: "Inter, sans-serif",
            boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
          },
        }}
      />
    </NavProvider>
  );
}
