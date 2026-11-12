import type { AgentListOutput, ModelListOutput, ProviderListOutput } from "@opencode/client/promise"
import type { Agent, Project, Provider, ProviderListResponse } from "@/runtime/server/types"
import type { Project as CurrentProject } from "@opencode/client/promise"
import { unwrap } from "solid-js/store"

export { pathKey as directoryKey, type PathKey as DirectoryKey } from "@/workspaces/path-key"

const providerCatalogs = new WeakMap<
  ProviderListOutput["data"],
  WeakMap<ModelListOutput["data"], ProviderListResponse>
>()

export function normalizeAgentList(input: AgentListOutput["data"] | Agent[]): Agent[] {
  if (input.every((agent) => !("request" in agent))) return input as Agent[]

  return (input as AgentListOutput["data"]).map((agent) => ({
    name: agent.id,
    description: agent.description,
    mode: agent.mode,
    hidden: agent.hidden,
    temperature:
      typeof agent.request.settings.temperature === "number" ? agent.request.settings.temperature : undefined,
    topP: typeof agent.request.settings.topP === "number" ? agent.request.settings.topP : undefined,
    color: agent.color,
    permission: agent.permissions.map((rule) => ({
      permission: rule.action,
      pattern: rule.resource,
      action: rule.effect,
    })),
    model: agent.model && { providerID: agent.model.providerID, modelID: agent.model.id },
    variant: agent.model?.variant,
    prompt: agent.system,
    options: agent.request.settings,
    steps: agent.steps,
  }))
}

export function normalizeProviderList(
  input: ProviderListOutput["data"] | ProviderListResponse,
  catalog?: ModelListOutput["data"],
): ProviderListResponse {
  if (!Array.isArray(input)) return input
  // Client sync replaces whole catalog lists. Track those reads at the caller,
  // not every model field, and share conversions without retaining old lists.
  const providers = unwrap(input)
  const models = unwrap(catalog)
  const cached = models && providerCatalogs.get(providers)?.get(models)

  if (cached) return cached
  const all = new Map<string, Provider>()

  for (const provider of providers) {
    all.set(provider.id, {
      id: provider.id,
      canonical: provider.canonical,
      integrationID: provider.integrationID,
      name: provider.name,
      source: "custom",
      env: [],
      options: provider.settings ?? {},
      models: {},
    })
  }

  for (const model of models ?? []) {
    const provider = all.get(model.providerID)

    if (!provider || model.status === "deprecated") continue
    const cost = model.cost.find((item) => item.tier === undefined) ?? model.cost[0]
    provider.models[model.id] = {
      id: model.id,
      providerID: model.providerID,
      api: {
        id: model.modelID,
        url: "",
        npm: model.package ?? provider.id,
      },
      name: model.name,
      family: model.family,
      capabilities: {
        temperature: false,
        reasoning: false,
        attachment: model.capabilities.input.some((item) => item !== "text"),
        toolcall: model.capabilities.tools,
        input: {
          text: model.capabilities.input.includes("text"),
          audio: model.capabilities.input.includes("audio"),
          image: model.capabilities.input.includes("image"),
          video: model.capabilities.input.includes("video"),
          pdf: model.capabilities.input.includes("pdf"),
        },
        output: {
          text: model.capabilities.output.includes("text"),
          audio: model.capabilities.output.includes("audio"),
          image: model.capabilities.output.includes("image"),
          video: model.capabilities.output.includes("video"),
          pdf: model.capabilities.output.includes("pdf"),
        },
        interleaved: false,
      },
      cost: {
        input: cost?.input ?? 0,
        output: cost?.output ?? 0,
        cache: {
          read: cost?.cache.read ?? 0,
          write: cost?.cache.write ?? 0,
        },
      },
      limit: model.limit,
      status: model.status,
      options: model.settings ?? {},
      headers: model.headers ?? {},
      release_date: new Date(model.time.released).toISOString().slice(0, 10),
      variants: Object.fromEntries(model.variants.map((variant) => [variant.id, variant.settings ?? {}])),
    }
  }

  if (!all.has("neuratal")) {
    all.set("neuratal", {
      id: "neuratal",
      canonical: "neuratal",
      integrationID: "neuratal",
      name: "Neuratal",
      source: "custom",
      env: ["NEURATAL_API_KEY"],
      options: {},
      models: {},
    })
  }

  const neuratal = all.get("neuratal")!
  if (!neuratal.models["kazahana"]) {
    neuratal.models["kazahana"] = {
      id: "kazahana",
      providerID: "neuratal",
      api: { id: "kazahana", url: "http://localhost:8765/v1", npm: "@opencode/ai/providers/neuratal" },
      name: "Kazahana (3x Balanced Pro)",
      family: "kazahana",
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false,
      },
      cost: { input: 0, output: 0, cache: { read: 0, write: 0 } },
      limit: { context: 256_000, output: 16_384 },
      status: "active",
      options: {},
      headers: {},
      variants: {},
      release_date: "2026-10-01",
    }
  }
  if (!neuratal.models["akisame"]) {
    neuratal.models["akisame"] = {
      id: "akisame",
      providerID: "neuratal",
      api: { id: "akisame", url: "http://localhost:8765/v1", npm: "@opencode/ai/providers/neuratal" },
      name: "Akisame (1x Fast Coding)",
      family: "akisame",
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false,
      },
      cost: { input: 0, output: 0, cache: { read: 0, write: 0 } },
      limit: { context: 128_000, output: 8_192 },
      status: "active",
      options: {},
      headers: {},
      variants: {},
      release_date: "2026-10-01",
    }
  }
  if (!neuratal.models["hatsukaze"]) {
    neuratal.models["hatsukaze"] = {
      id: "hatsukaze",
      providerID: "neuratal",
      api: { id: "hatsukaze", url: "http://localhost:8765/v1", npm: "@opencode/ai/providers/neuratal" },
      name: "Hatsukaze (8x Deep Architecture)",
      family: "hatsukaze",
      capabilities: {
        temperature: true,
        reasoning: true,
        attachment: false,
        toolcall: true,
        input: { text: true, audio: false, image: false, video: false, pdf: false },
        output: { text: true, audio: false, image: false, video: false, pdf: false },
        interleaved: false,
      },
      cost: { input: 0, output: 0, cache: { read: 0, write: 0 } },
      limit: { context: 1_000_000, output: 65_536 },
      status: "active",
      options: {},
      headers: {},
      variants: {},
      release_date: "2026-10-01",
    }
  }

  const result = {
    all,
    connected: [...new Set([...providers.map((provider) => provider.id), "neuratal"])],
    default: {
      neuratal: "kazahana",
      ...Object.fromEntries(
        providers.flatMap((provider) => {
          const model = models?.find((item) => item.providerID === provider.id && item.status !== "deprecated")

          return model ? [[provider.id, model.id]] : []
        }),
      ),
    },
  }

  if (models) {
    const cache = providerCatalogs.get(providers) ?? new WeakMap<ModelListOutput["data"], ProviderListResponse>()
    cache.set(models, result)
    providerCatalogs.set(providers, cache)
  }

  return result
}

export function normalizeProjectInfo(project: Project | CurrentProject): Project {
  const worktree = "canonical" in project ? project.canonical : project.worktree

  return {
    ...project,
    worktree,
    worktrees: "worktrees" in project ? project.worktrees : [{ directory: worktree }],
  }
}

export function updateProjectInfo(project: Project, update: CurrentProject): Project {
  return {
    ...project,
    ...update,
    worktree: update.canonical,
    worktrees: project.worktrees,
  }
}
