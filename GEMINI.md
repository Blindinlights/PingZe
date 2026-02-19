# Chinese Classical Poetry Prosody Linter

## Project Overview

This project is a web-based tool for validating Chinese classical poetry (Ci)
against established tonal patterns (Cipai). It allows users to input poems and
receive real-time feedback on tonal (Ping/Ze) compliance and rhyming.

**Key Features:**

- **Prosody Linter:** Checks user input against selected Cipai (e.g., "Yu Mei
  Ren") for tonal accuracy and rhyme schemes.
- **Visual Feedback:** Color-coded indicators for correct/incorrect tones, rhyme
  errors, and missing/overflowing characters.
- **Schema Builder:** (In development) Interface for creating custom prosody
  schemas.
- **Engine:** Custom logic engine using `pinyin-pro` for character analysis and
  rhyme group inference.

**Tech Stack:**

- **Runtime:** Deno
- **Framework:** React (via Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Pinyin/Rhyme Library:** `pinyin-pro`

## Building and Running

This project uses Deno as the runtime and task runner. Ensure Deno is installed.

**Key Commands:**

| Command             | Description                                    |
| :------------------ | :--------------------------------------------- |
| `deno task dev`     | Start the development server (invokes `vite`). |
| `deno task build`   | Build the application for production.          |
| `deno task preview` | Preview the production build locally.          |

## Project Structure

- `src/App.tsx`: Main application entry point and layout.
- `src/components/`: React UI components.
  - `PoetryLinter.tsx`: Core interactive linter interface.
  - `SchemaBuilder.tsx`: Component for defining new Cipai patterns.
- `src/logic/`: Core business logic.
  - `prosody-engine.ts`: Logic for validating poems, checking tones, and
    inferring rhyme groups.
  - `rhyme-map.ts`: Definitions for rhyme groups (Pingshui Yun or similar
    standard).
- `src/data/`: Static data assets.
  - `cipai-list.ts`: Definitions of Cipai structures (patterns, tones, rhyme
    positions).
- `deno.json`: Deno configuration, task definitions, and import maps.

## Development Conventions

- **Logic Separation:** Keep core validation logic in `src/logic` purely
  functional and decoupled from UI components.
- **Type Safety:** Heavy use of TypeScript interfaces (`Cipai`, `LineSchema`,
  `ValidationResult`) to ensure data integrity.
- **Styling:** Use Tailwind CSS utility classes for all styling needs.
- **Language:** Source code (variables, functions) is in English. UI text and
  comments are often in Chinese to match the domain.
- **Tone Representation:**
  - `Ping`: Level tone (平)
  - `Ze`: Oblique tone (仄)
  - `Zhong`: Wildcard/Any (中/◎)
