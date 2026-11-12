export function getLastActiveUrl(windowID: string) {
  if (typeof localStorage !== "object") return "/"

  try {
    return acceptedLastActiveUrl(localStorage.getItem(windowLastActiveUrlKey(windowID)))
  } catch {
    return "/"
  }
}

export function setLastActiveUrl(windowID: string, value: string) {
  if (typeof localStorage !== "object") return

  try {
    localStorage.setItem(windowLastActiveUrlKey(windowID), value)
  } catch {}
}

// Neuratal Code always opens on Home. A saved chat is never restored: the user
// picks a flow from the deck, so launching the app never drops them mid-session.
export function acceptedLastActiveUrl(value: string | null | undefined) {
  if (!value) return "/"
  const path = value.split(/[?#]/, 1)[0]

  if (path === "/") return value

  if (path === "/settings") return value

  return "/"
}

function windowLastActiveUrlKey(windowID: string) {
  return `opencode.desktop.window.${windowID}.last-active-url`
}
