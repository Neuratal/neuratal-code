// Route warming: screens are lazy-loaded, so the first navigation pays the
// module's download and evaluation cost while the click is already waiting.
// Importing ahead (on Home idle, hover, or focus) fills the module cache that
// the lazy() routes then reuse, making the transition feel immediate.

let newSession: Promise<typeof import("@/new-session/route")> | undefined
let session: Promise<[typeof import("@/session/route"), typeof import("@opencode/session-ui/file")]> | undefined
let settings: Promise<typeof import("@/settings/shell")> | undefined

export function warmNewSessionRoute() {
  return (newSession ??= import("@/new-session/route"))
}

export function warmSessionRoute() {
  return (session ??= Promise.all([import("@/session/route"), import("@opencode/session-ui/file")]))
}

export function warmSettingsRoute() {
  return (settings ??= import("@/settings/shell"))
}
