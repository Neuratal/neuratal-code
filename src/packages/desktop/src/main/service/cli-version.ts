export function parseCliVersion(output: string) {
  const marker = output.lastIndexOf(" v")
  const version = marker === -1 ? output : output.slice(marker + 2)

  if (!version) throw new Error("V2 CLI did not provide a version")

  return version
}

/**
 * The registration filename the bundled CLI writes for its channel. The CLI keeps the release
 * channels on `service.json` and names every other channel after itself, so the desktop must read
 * the file that matches the CLI it shipped rather than assuming the release-channel default.
 */
export function serviceRegistrationFile(version: string) {
  const channel = /^0\.0\.0-(.+)-(\d+(?:\.\d+)?)$/.exec(version)?.[1] ?? "latest"
  if (channel === "latest" || channel === "dev" || channel === "beta" || channel === "next") return "service.json"
  return `service-${channel.replace(/[^a-zA-Z0-9._-]/g, "-")}.json`
}

export function serviceVersion(input: {
  readonly channel: "local" | "dev" | "beta" | "prod"
  readonly isolated?: boolean
  readonly mode: "initial" | "reconnect"
  readonly version: string
}) {
  if (input.mode === "reconnect") return undefined

  if (input.channel === "beta" && !input.isolated) return undefined

  return input.version
}

// Retrying on timeout can also replace a server stuck in a migration longer than 120 s, which is accepted.
export function shouldRetryEnsure(version: string | undefined, message: string) {
  if (version !== undefined) return false

  return (
    message === "Background service failed to start" ||
    message === "Timed out waiting for the background service to start"
  )
}

export function stageName(version: string, arch = process.arch) {
  return `${version}-${arch}`.replace(/[^a-zA-Z0-9._-]/g, "-")
}

export function keptStages(bundledVersion: string, runningVersion?: string, arch = process.arch) {
  const stages = [stageName(bundledVersion, arch)]

  if (runningVersion && runningVersion !== bundledVersion) stages.push(stageName(runningVersion, arch))

  return stages
}
