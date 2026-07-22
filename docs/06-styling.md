# Styling

**Vanilla CSS only.** No Tailwind, no CSS modules, no CSS-in-JS. Do not introduce any.

| File | Lines | Scope |
|---|---|---|
| [src/app/globals.css](../src/app/globals.css) | ~359 | Design tokens, resets, animations, utilities. Imported by the root layout |
| [src/styles/invitation.css](../src/styles/invitation.css) | ~1425 | Everything guest-facing, including all theme palettes. Imported by the invitation `page.tsx` |
| [src/styles/admin.css](../src/styles/admin.css) | ~669 | Admin dashboard shell, tables, modals, forms |

## Design tokens (`:root` in globals.css)

```css
--bg-cream-light: #FFFBF5;   --bg-cream-dark: #F7EFE5;
--primary-sage: #A8BBA0;     --primary-sage-hover: #96a98e;   --primary-sage-light: #E8EFE5;
--secondary-olive: #4E5C47;  --accent-gold: #C9A96E;          --accent-gold-light: #F4EAD4;
--text-dark: #2F362E;        --text-medium: #555E53;          --text-light: #7D887B;
--border-color: #E2E8DF;
```

Admin surface uses its own set: `--admin-primary` `#4E5C47`, `--admin-bg` `#F8FAF7`,
`--admin-card-bg`, `--admin-text`, `--admin-text-sub`, `--admin-border`.

Also defined: `--shadow-{sm,md,lg}`, `--radius-{sm,md,lg,full}`, and a responsive spacing scale
`--space-xs … --space-3xl` built from `clamp()` — prefer these over hard-coded rem values so
layouts stay fluid without media queries.

## Typography

```css
--font-serif: var(--font-playfair), Georgia, serif;   /* headings */
--font-body:  var(--font-lora), system-ui, sans-serif; /* body */
```

Both are loaded with `next/font` in [src/app/layout.tsx](../src/app/layout.tsx), which exposes the
`--font-playfair` / `--font-lora` variables.

## Conventions

- Use classes, never inline styles — the only accepted exceptions are genuinely dynamic values
  (`backgroundImage`, `objectPosition` from `*ImagePosition` fields, computed widths).
- Theme overrides live in one place: the `.invitation-body.theme-<name>` blocks at the top of
  `invitation.css`. Adding a theme = adding one block + one `<option>` in the settings page.
- Animation utility classes (`animate-fade-in`, `animate-fade-in-up`, …) are declared in
  `globals.css` and applied by components; `ScrollReveal` toggles them on intersection.
- `html { scroll-behavior: smooth }` is global, which is what makes the floating RSVP button's
  `scrollIntoView` glide.
