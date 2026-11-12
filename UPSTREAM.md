# UPSTREAM INTEGRATION & ARCHITECTURE

> **Note on the public tree:** the published repository is a fresh snapshot import of the Neuratal Code tree (single initial commit), not the historical upstream log. Upstream is [opencode](https://github.com/anomalyco/opencode) (MIT). This repo's default branch is `main` (not `dev` as described in `src/AGENTS.md`, which documents upstream's own workflow).

## Upstream Project
- **Source:** [OpenCode](https://github.com/anomalyco/opencode)
- **Upstream Branch:** `dev`
- **Upstream Commit Reference:** Preserved in Git commit log and `upstream-opencode/`

---

## Architectural Modifications in Neuratal Code

Neuratal Code extends the OpenCode foundation into a bespoke, enterprise-grade AI software engineering desktop application aligned with the Neuratal visual and model ecosystem:

### 1. Brand & Design System (Neuratal True-Black OLED)
- **Palette**: True-Black OLED background (`#000000`), deep charcoal structural surfaces (`#0B0B0C`, `#141416`, `#1E1E20`), Turkish Turquoise primary accent (`#00D2C4`), subtle turquoise glow (`#22D3EE`), and accent colors for Akisame (`#38BDF8`), Kazahana (`#00D2C4`), and Hatsukaze (`#F5B841`).
- **Typography**: Inter and JetBrains Mono code rendering for maximum legibility in long coding sessions.
- **Theme**: First-class default theme `neuratal` introduced in `@opencode/ui/src/theme/themes/opencode.json` and registered as the primary default theme in `context.tsx`.
- **Identity Assets**: Neuratal branded vector icons, app launcher iconography, window titles, and wordmarks.

### 2. Multi-Profile Agent System
Extended the agent runtime (`@opencode/core` and `@opencode/schema`) with dedicated specialized profiles:
1. **Build**: Full development agent with autonomous file mutation, shell tool execution, and code synthesis.
2. **Plan**: Read-only strategic analysis and architectural planning agent. Denies edits outside the designated plan directory.
3. **Code Review**: Audits diffs, catches anti-patterns, checks test coverage and security concerns without writing changes.
4. **Debug**: Root-cause diagnostic agent specialized in reading stack traces, running regression tests, and pinpointing bug fixes.
5. **Research**: Technical exploration, documentation lookup, codebase structure analysis, and web search.

### 3. Audio & Haptic Feedback Engine
- Subtle, optional interface sound effects powered by native Web Audio API using original Neuratal sound assets (`done.wav`, `send.wav`, `copy.wav`, `error.wav`, `first_token.wav`, `warning.wav`, `startup.wav`).
- Granular settings in General Settings: global toggle (defaulting to **OFF**), volume control slider, and per-event sound toggles.

### 4. Model Ecosystem Integration
- Native compatibility with Neuratal-hosted models (Akisame, Kazahana, Hatsukaze) as well as OpenAI, Anthropic, Google Gemini, and local Ollama/LM Studio endpoints.
- Real-time connection status, model capability tags, and secure credential handling.

### 5. Safe-by-Default Security Layer
- Explicit confirmation required before executing destructive terminal commands (`rm -rf`, `dd`, `mkfs`, etc.).
- Automatic protection of sensitive environment and credential files (`.env`, `*.key`, `*.pem`, `id_rsa`).
- Safe workspace isolation preventing accidental file operations outside project boundaries.

---

## Maintaining Upstream Synchronicity

To pull future updates from OpenCode:
```bash
git remote add upstream https://github.com/anomalyco/opencode.git
git fetch upstream
git merge upstream/dev
```
Merge conflicts should preserve Neuratal brand themes (`opencode.json`), sound integrations, and custom agent profile definitions while taking core bug fixes and performance improvements from upstream.
