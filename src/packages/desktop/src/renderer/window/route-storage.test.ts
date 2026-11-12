import { describe, expect, test } from "bun:test"
import { acceptedLastActiveUrl } from "./route-storage"

describe("desktop last active route", () => {
  test("opens on Home and only restores Settings", () => {
    expect(acceptedLastActiveUrl("/")).toBe("/")
    expect(acceptedLastActiveUrl("/settings?server=local&tab=models")).toBe("/settings?server=local&tab=models")
    expect(acceptedLastActiveUrl("/new-session?directory=C%3A%5Cwork#draft")).toBe("/")
    expect(acceptedLastActiveUrl("/server/wsl%3ADebian/session/abc?view=review#file")).toBe("/")
    expect(acceptedLastActiveUrl(undefined)).toBe("/")
    expect(acceptedLastActiveUrl("/settings/extra")).toBe("/")
    expect(acceptedLastActiveUrl("/new-session/extra")).toBe("/")
    expect(acceptedLastActiveUrl("/server/sidecar/session/abc/extra")).toBe("/")
  })
})
