# Memora — UI Refinements Spec

---

## 1. Fix: "Quiz Again" Redirect to `/login` Bug

### Context
After Topic Onboarding and completing the first quiz, the **Quiz Completion screen** has a "Quiz Again with New Questions" option. Clicking it should generate new AI questions and start a fresh quiz session. The questions are being generated correctly in the system, but the app redirects to `/login` instead of launching the new quiz.

### Root Cause (Likely)
The new quiz session is being initiated as if it's a fresh unauthenticated flow. The auth token / session state is probably not being passed through when the new quiz is triggered — the app treats the new quiz start as a new entry point and hits an auth guard before the questions can be rendered.

### What Needs to Be Fixed

1. **Preserve auth state through the "Quiz Again" flow.**  
   When the user clicks "Quiz Again with New Questions," the request to generate new questions and navigate to the quiz should carry the existing authenticated session (token/cookie). Do not clear or reset auth state at quiz completion.

2. **Check the navigation call after question generation.**  
   After new questions are generated, the router push / redirect should point to the quiz route (e.g. `/quiz/[topicId]` or `/quiz/session`), not to a route that sits behind a login guard that re-evaluates auth from scratch.

3. **Verify the auth guard on the quiz route.**  
   The quiz page's auth guard (middleware or `getServerSideProps` / layout-level check) should correctly recognise the existing session. If the guard is checking for a query param or a specific state flag that isn't present on the "retry" path, add that flag.

4. **Do not re-initialise the quiz as a new onboarding flow.**  
   The "Quiz Again" path should skip onboarding entirely and jump straight to the quiz with the already-selected topic. Ensure the route or state used for retry is distinct from the first-time onboarding entry point if the latter triggers any auth re-check.

### Acceptance Criteria
- User completes a quiz → clicks "Quiz Again with New Questions" → new questions are generated → new quiz starts immediately, no redirect to `/login`.
- User stays authenticated throughout; no session loss between quiz completion and quiz restart.
- If the user truly is not authenticated (e.g. session expired), *then* redirect to `/login` — but not when they have a valid active session.

---

## 2. Logo Update — Replace with New Memora Mark

### New Logo Description
The new Memora logo is a **graph/node mark** — three nodes connected in a triangle formation with the wordmark "Memora" to the right.

**Mark anatomy:**
- Top node (primary): filled circle, full opacity — `cx="16" cy="9" r="4.5"`
- Bottom-left node: filled circle, ~55% opacity — `cx="8" cy="23" r="3"`
- Bottom-right node: filled circle, ~55% opacity — `cx="24" cy="23" r="3"`
- Edges: two lines from top node to each bottom node (45% opacity, `stroke-width="1.5"`), one line connecting bottom two nodes (30% opacity, `stroke-width="1.2"`)
- Subtle outer glow ring on top node: `r="6.5"`, 15% opacity stroke, no fill
- All strokes and fills use `currentColor` for full theme adaptability

**Wordmark:** `"Memora"` — Plus Jakarta Sans, `font-weight: 700`, `letter-spacing: -0.025em`

### Full SVG Mark (32×32, copy-paste ready)

```svg
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Memora mark">
  <line x1="16" y1="9" x2="8" y2="23" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.45" stroke-linecap="round"/>
  <line x1="16" y1="9" x2="24" y2="23" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.45" stroke-linecap="round"/>
  <line x1="8" y1="23" x2="24" y2="23" stroke="currentColor" stroke-width="1.2" stroke-opacity="0.3" stroke-linecap="round"/>
  <circle cx="16" cy="9" r="6.5" stroke="currentColor" stroke-opacity="0.15" stroke-width="1"/>
  <circle cx="8" cy="23" r="3" fill="currentColor" fill-opacity="0.55"/>
  <circle cx="24" cy="23" r="3" fill="currentColor" fill-opacity="0.55"/>
  <circle cx="16" cy="9" r="4.5" fill="currentColor"/>
</svg>
```

### Where to Apply

Replace every instance of the existing logo mark/lockup across:

| Location | Notes |
|---|---|
| Navbar / top nav | 32px mark + wordmark at 22px |
| Footer | 20px mark + wordmark at 15px |
| Browser tab favicon | Mark only, no wordmark |
| Auth screens (login, signup) | Mark + wordmark, centred |
| Onboarding screens | Mark + wordmark |
| Email templates | Static PNG export of mark |
| `og:image` / social meta | Static PNG export |

### Logo Component (React)

Create a reusable `<MemoraLogo>` component. Accept a `size` prop (`"sm" | "md" | "lg"`) and a `markOnly` boolean:

```tsx
// components/MemoraLogo.tsx

const sizes = {
  sm: { icon: 20, text: 15 },
  md: { icon: 32, text: 22 },
  lg: { icon: 40, text: 28 },
};

export function MemoraLogo({
  size = "md",
  markOnly = false,
}: {
  size?: "sm" | "md" | "lg";
  markOnly?: boolean;
}) {
  const { icon, text } = sizes[size];
  return (
    <a className="logo" href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "inherit", textDecoration: "none" }}>
      <svg width={icon} height={icon} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Memora mark">
        <line x1="16" y1="9" x2="8" y2="23" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.45" strokeLinecap="round"/>
        <line x1="16" y1="9" x2="24" y2="23" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.45" strokeLinecap="round"/>
        <line x1="8" y1="23" x2="24" y2="23" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.3" strokeLinecap="round"/>
        <circle cx="16" cy="9" r="6.5" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1"/>
        <circle cx="8" cy="23" r="3" fill="currentColor" fillOpacity="0.55"/>
        <circle cx="24" cy="23" r="3" fill="currentColor" fillOpacity="0.55"/>
        <circle cx="16" cy="9" r="4.5" fill="currentColor"/>
      </svg>
      {!markOnly && (
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: text, letterSpacing: "-0.025em", lineHeight: 1 }}>
          Memora
        </span>
      )}
    </a>
  );
}
```

### Theme Behaviour
- The mark uses `currentColor` throughout — it will adapt automatically to dark/light mode and accent states.
- For **hover accent**: wrap usage in a class that sets `color: var(--accent)` on hover (already handled if inheriting from parent `.logo` styles).
- For **dark mode**: white/light base color — mark renders white.
- For **light mode**: set `color: #18181c` explicitly on the component or parent.

### Font Dependency
Ensure `Plus Jakarta Sans` is loaded:
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700&display=swap" rel="stylesheet" />
```
Or via your existing font config (it's already in the project).

---

*Last updated: March 2026*