import { useState } from "react";
import { motion } from "motion/react";
import { c } from "../tokens";
import { StatusBg, NavBar, Eyebrow, Pressable } from "../Chrome";
import { Check } from "lucide-react";
import { useNav } from "../nav";
import { toast } from "sonner";

const fields: { key: string; label: string; required?: boolean; placeholder?: string }[] = [
  { key: "name", label: "Nom du magasin", required: true, placeholder: "Ex. Épicerie Ben Ali" },
  { key: "area", label: "Quartier", placeholder: "Ex. El Biar" },
  { key: "manager", label: "Gérant", placeholder: "Ex. Karim Ben Ali" },
  { key: "phone", label: "Téléphone", placeholder: "0555 12 34 56" },
  { key: "address", label: "Adresse", placeholder: "Rue, ville" },
];

export function NewStore() {
  const nav = useNav();
  const [values, setValues] = useState<Record<string, string>>({});

  const save = () => {
    if (!values.name) {
      toast.error("Le nom du magasin est requis");
      return;
    }
    toast.success("Magasin enregistré", { description: values.name });
    nav.back();
  };

  return (
    <StatusBg>
      <NavBar back title="Nouveau magasin" />

      <div className="absolute inset-0 overflow-y-auto" style={{ paddingTop: 105, paddingBottom: 110 }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ padding: "0 22px 18px" }}
        >
          <Eyebrow style={{ marginBottom: 14 }}>Informations du magasin</Eyebrow>

          <div
            style={{
              background: "linear-gradient(180deg, #1d1d1d 0%, #141414 100%)",
              border: `1px solid ${c.borderLight}`,
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            {fields.map((f, i) => (
              <div
                key={f.key}
                style={{
                  padding: "12px 16px",
                  borderBottom: i === fields.length - 1 ? "none" : `1px solid ${c.borderLight}`,
                }}
              >
                <div
                  className="uppercase"
                  style={{
                    fontSize: 9.5,
                    fontWeight: 600,
                    color: c.white40,
                    letterSpacing: 1.5,
                    marginBottom: 6,
                  }}
                >
                  {f.label}
                  {f.required && <span style={{ color: c.red, marginLeft: 4 }}>*</span>}
                </div>
                <input
                  value={values[f.key] || ""}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  style={{
                    width: "100%",
                    fontSize: 14,
                    fontWeight: 500,
                    color: c.white,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    fontFamily: "inherit",
                    letterSpacing: -0.2,
                  }}
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div
        className="absolute z-30"
        style={{
          left: 0,
          right: 0,
          bottom: 0,
          paddingTop: 32,
          paddingBottom: 30,
          paddingLeft: 16,
          paddingRight: 16,
          background: "linear-gradient(180deg, transparent 0%, rgba(10,10,10,0.85) 30%, #0A0A0A 60%)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Pressable
          onClick={save}
          style={{
            background: `linear-gradient(135deg, #9bff1f 0%, ${c.lime} 50%, #66c000 100%)`,
            borderRadius: 16,
            padding: "14px 16px",
            gap: 8,
            boxShadow:
              "0 12px 28px rgba(127,227,0,0.4), 0 0 0 1px rgba(127,227,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check size={16} color={c.ink} strokeWidth={3} />
          <span style={{ fontSize: 13, fontWeight: 700, color: c.ink, letterSpacing: -0.2 }}>
            Enregistrer
          </span>
        </Pressable>
      </div>
    </StatusBg>
  );
}
