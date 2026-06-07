# RASSID — React Native Porting Brief

This is a porting reference for the RASSID interactive web prototype built in Figma Make. The prototype is the **visual & UX source of truth** — re-implement it in React Native with the substitutions below. Layout values (padding, radius, font sizes, spacing) port 1:1.

---

## 1. Source documents

- **Interactive prototype:** see Figma Make URL provided alongside this brief
- **`RASSID_DESIGN_SPEC.md`** — original product spec (color tokens, screen list)
- **`RASSID_COPY_STRUCTURE.md`** — exact French copy and structure for every screen
- **Web prototype source** — under `src/app/` in the shared project

When in doubt about copy, the copy doc wins. When in doubt about layout, the prototype wins.

---

## 2. Stack mapping

| Web prototype uses | React Native replacement |
|---|---|
| `motion/react` (Motion) | `moti` + `react-native-reanimated` (Moti's API closely mirrors Motion, including `AnimatePresence`) |
| `motion.div layoutId="x"` (shared layout) | `MotiView` + manual layout animation, or Reanimated `LayoutAnimation` |
| `lucide-react` | `lucide-react-native` (drop-in, same icon names) |
| `sonner` | `sonner-native` or `react-native-toast-message` |
| Tailwind classes (`flex`, `items-center`, …) | `StyleSheet` objects, or NativeWind if the project already uses it |
| `linear-gradient(...)` in CSS | `expo-linear-gradient` (`<LinearGradient colors={[...]} start={} end={} />`) |
| `radial-gradient(...)` (ambient glows) | `react-native-radial-gradient`, or a large blurred `View` with `opacity` |
| `backdropFilter: blur(...)` | `expo-blur` (`<BlurView intensity={...} />`) |
| `WebkitBackgroundClip: text` (gradient headings) | `@react-native-masked-view/masked-view` + `LinearGradient` as the mask source |
| `boxShadow` (multi-layer + inset) | iOS: `shadowColor/Offset/Opacity/Radius` props; Android: `elevation`; inset highlights → 1px hairline border |
| `<div>` `<span>` | `<View>` `<Text>` |
| `<input>` | `<TextInput>` |
| `<button>` (the `Pressable` wrapper) | `Pressable` from `react-native` (already mirrors the API) with `react-native-reanimated` `withSpring` for the `whileTap` scale |
| `overflow-y-auto` containers | `ScrollView`, or `FlatList` for long lists (Stores, History, OverdueAlerts) |
| Inline `style={{ ... }}` | Same — RN supports inline style objects, just no kebab-case CSS values |
| SVG data URI for noise grain | `react-native-svg` `<Svg>` with `<Filter>` + `<FeTurbulence>`, or skip on RN if costly |
| Google Fonts `@import` for Inter | `expo-font` with the Inter family (load on app boot) |

---

## 3. Code conventions to preserve verbatim

These are tuned and battle-tested — do not redesign them.

- **Color tokens** — copy `src/app/components/tokens.ts` as-is. Same keys, same hex values.
- **Spacing** — `padding: 22` for screen horizontal padding, `paddingTop: 105` after the floating nav bar, `paddingBottom: 100–110` above the tab bar. Keep these constants.
- **Radius scale** — 12 (input), 14 (chip), 16 (button), 18 (card), 22 (hero card), 100 (pill / FAB).
- **Typography scale** — body 13/14, eyebrow 10 uppercase letterSpacing 1.8, hero numbers 36–56 with letterSpacing −1.6 to −3, all `fontVariantNumeric: "tabular-nums"` on numbers. Use Inter 500/600/700.
- **Animation timings** — entrance `duration 0.4–0.45` `ease [0.32, 0.72, 0, 1]`, list stagger `delay 0.05 * i + 0.15`, spring `stiffness 400, damping 32`. Map to Reanimated `withTiming` / `withSpring` with the same numbers.
- **Number count-up** — see `AnimatedNumber` in `src/app/components/Chrome.tsx`. Re-implement with `useSharedValue` + `withTiming` + cubic ease-out, formatted with `toLocaleString("fr-FR")` and a space thousands separator.

---

## 4. Visual approximations (acceptable losses)

These web effects are expensive in RN — approximate, don't recreate pixel-perfect:

- **Radial glow blobs** behind hero cards → a `View` with `borderRadius: 9999`, the glow color at low opacity, and a static `opacity` value. Skip the blur if perf is a concern.
- **Inset 1px highlight** on cards → top `borderTopColor: 'rgba(255,255,255,0.04)'` + `borderTopWidth: 1`.
- **Multi-stop linear gradients on text** → 2 stops are usually enough.
- **Grain/noise overlay** → optional. Skip on Android if it causes overdraw.

The animated bar charts (Dashboard `MiniBars`, weekly flow on Dashboard, severity bar on OverdueAlerts) are all simple `View` heights animated with Reanimated — port directly.

---

## 5. Screen-by-screen checklist

For each screen, the file under `src/app/components/screens/` is the reference.

- [ ] **Dashboard** — greeting + sync badge, KPI bento (Créances / Magasins / Encaissé), Activité (Livraisons + Paiements Reçus charts), Alertes link, Route du jour list, FAB, tab bar.
- [ ] **Stores** — large title, search input, filter pills with shared-element active indicator, store rows with status dot, FAB → Nouveau magasin.
- [ ] **StoreProfile** — avatar + name, quick actions (Appeler/Message/Itinéraire), hero balance card, INFORMATIONS list, Historique link, action dock (Livraison / Paiement / Retour / Avoir).
- [ ] **History** — month net hero, In/Out summary, filter pills, date-grouped tx rows with debt delta in group header.
- [ ] **NewOperation** — animated segmented type control, total hero (color-shifts per type), magasin row, articles list with qty steppers (deliveries) or amount input + quick chips (other types), bottom dock with BL secondary + Confirmer primary.
- [ ] **NewStore** — single card form, required field marker on Nom du magasin, Enregistrer button.
- [ ] **OverdueAlerts** — warning banner, Magasins en alerte list, Tous les magasins par dette list.
- [ ] **Deliveries / Payments** (tab landing pages) — month KPI hero + empty-state explainer + primary CTA.

Tab bar shared component: `MinimalTabBar` in `Dashboard.tsx`.

---

## 6. Navigation

The web prototype uses a simple stack-based context (`nav.tsx`). For RN, use **`@react-navigation/native`** with:
- A bottom tab navigator (Accueil / Livraisons / Paiements / Magasins)
- A native stack inside each tab for push screens (StoreProfile, History, NewOperation, NewStore, OverdueAlerts)

`nav.go("storeProfile", { storeId })` maps to `navigation.navigate("StoreProfile", { storeId })`.

---

## 7. What NOT to change

- Don't redesign the visual language — same color, type, radii, spacing, motion.
- Don't add features beyond what the spec lists.
- Don't introduce a UI library (NativeBase, etc.) — primitives + your own components only.
- Don't replace Inter with a system font.

---

## 8. Suggested package set

```
react-native-reanimated
moti
expo-linear-gradient        (or react-native-linear-gradient if non-Expo)
expo-blur                   (or @react-native-community/blur)
@react-native-masked-view/masked-view
react-native-svg
lucide-react-native
sonner-native
@react-navigation/native
@react-navigation/bottom-tabs
@react-navigation/native-stack
expo-font                   (or react-native-vector-icons setup for fonts)
```
