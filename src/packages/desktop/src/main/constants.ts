import { app } from "electron"

type Channel = "local" | "dev" | "beta" | "prod"

const raw = import.meta.env.OPENCODE_CHANNEL

export const CHANNEL: Channel = raw === "local" || raw === "dev" || raw === "beta" || raw === "prod" ? raw : "dev"

export const VERSION = app.isPackaged ? app.getVersion() : (process.env.OPENCODE_VERSION ?? app.getVersion())

const appNames: Record<string, string> = {
  dev: "Neuratal Code Dev",
  beta: "Neuratal Code Beta",
  prod: "Neuratal Code",
}

const appIDs: Record<string, string> = {
  dev: "ai.neuratal.code.dev",
  beta: "ai.neuratal.code.beta",
  prod: "ai.neuratal.code",
}

// Local renderer/server mode keeps the dev application identity.
export const APP_NAME = app.isPackaged ? appNames[CHANNEL] : "Neuratal Code"

export const APP_ID = app.isPackaged ? appIDs[CHANNEL] : "ai.neuratal.code.dev"
