# AGENTS.md - Development Guide

## Build & Run Commands

This project uses **Deno** as the runtime with Vite for bundling.

```bash
deno task dev       # Start development server
deno task build     # Build for production
deno task preview   # Preview production build
deno task rules     # Regenerate cipai-list.ts from JSON rules
```

**Note:** There is no formal test suite. Testing is manual via the UI.

## Project Structure

```
src/
  ├── App.tsx              # Main app with tab navigation
  ├── main.tsx             # React entry point
  ├── index.css            # Tailwind + custom CSS variables
  ├── components/
  │   ├── PoetryLinter.tsx # Core linter UI component
  │   └── SchemaBuilder.tsx # Rule definition tool
  ├── logic/
  │   ├── prosody-engine.ts # Validation logic (pure functions)
  │   └── rhyme-map.ts     # Rhyme group mappings
  └── data/
      ├── cipai-list.ts    # Auto-generated Cipai array
      └── rules/*.json     # Individual Cipai definitions
```

## Code Style Guidelines

### Imports
- Use `.ts` or `.tsx` extensions in import paths (Deno requirement)
- Group imports: React first, then local modules
- JSON imports use `with { type: "json" }` syntax

### TypeScript
- Strict typing with explicit interfaces (`Cipai`, `LineSchema`, `ValidationResult`)
- Type aliases for unions: `type ToneType = 'Ping' | 'Ze' | 'Zhong'`
- Avoid `any`; use `unknown` with type assertion when necessary

### Naming Conventions
- **Components:** PascalCase (e.g., `PoetryLinter`)
- **Functions/Variables:** camelCase
- **Types/Interfaces:** PascalCase
- **Constants:** UPPER_SNAKE_CASE (e.g., `CIPAI_LIST`, `RHYME_GROUPS`)
- **Files:** Match export name (e.g., `prosody-engine.ts` exports `validatePoem`)

### Formatting
- 2-space indentation
- Semicolons required
- Double quotes for strings
- Trailing commas in multi-line objects/arrays

### Error Handling
- Return `null` or empty arrays for missing data
- Use try-catch only for JSON parsing or external calls
- UI components handle edge cases gracefully (empty input, missing lines)

### React Patterns
- Functional components with hooks (`useState`, `useEffect`)
- Keep logic in `src/logic/` pure and testable
- Props typed inline or via interface
- Use `className` with Tailwind; no CSS modules

### Tailwind CSS
- Utility-first; avoid custom CSS when possible
- Custom colors via CSS variables in `:root`
- Responsive: use `md:` prefix for breakpoints

### Domain Terminology
- **Ping (平):** Level tone
- **Ze (仄):** Oblique tone  
- **Zhong (中/通):** Wildcard (either tone allowed)
- **Cipai (词牌):** Tune pattern/schema
- **RhymeId:** Groups rhyme positions for rhyme-change detection

## Adding New Cipai

1. Add JSON file to `src/data/rules/`
2. Run `deno task rules` to regenerate `cipai-list.ts`
3. JSON structure:
```json
{
  "name": "词牌名",
  "lines": [{
    "pattern": [
      { "tone": "Ping"|"Ze"|"Zhong", "isRhyme": false|true, "rhymeId": 1 }
    ]
  }]
}
```

## Key Design Decisions

- **Optimistic Matching:** Polyphonic characters match if ANY reading is valid
- **Rhyme Inference:** Rhyme groups inferred from majority vote at rhyme positions
- **Logic Separation:** `prosody-engine.ts` is UI-agnostic and purely functional
- **No Test Framework:** Validation tested manually via UI interactions
