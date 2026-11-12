import type { ProviderPackage } from "../provider-package.js"
import { OpenAIChat } from "../protocols/openai-chat.js"
import { AuthOptions, type ProviderAuthOption } from "../route/auth-options.js"
import { Route, type RouteDefaultsInput } from "../route/client.js"
import { Endpoint } from "../route/endpoint.js"
import { ProviderID, type ModelID } from "../schema/index.js"
import type { OpenAIProviderOptionsInput } from "./openai-options.js"

export const id = ProviderID.make("neuratal")
const defaultBaseURL = process.env.NEURATAL_HOST_URL || process.env.NEURATAL_BASE_URL || "http://localhost:8765/v1"

export type Config = Omit<RouteDefaultsInput, "providerOptions"> &
  ProviderAuthOption<"optional"> & {
    readonly baseURL?: string
    readonly providerOptions?: OpenAIProviderOptionsInput
  }

export type Settings = ProviderPackage.Settings &
  OpenAIProviderOptionsInput & {
    readonly apiKey?: string
    readonly baseURL?: string
  }

export const route = Route.make({
  id: "neuratal-chat",
  provider: id,
  providerMetadataKey: "neuratal",
  protocol: OpenAIChat.protocol,
  endpoint: Endpoint.path("/chat/completions", { baseURL: defaultBaseURL }),
  framing: OpenAIChat.framing,
})

export const routes = [route]

export const configure = (input: Config = {}) => {
  const { apiKey: _apiKey, auth: _auth, baseURL: endpoint, ...defaults } = input
  const configured = route.with({
    ...defaults,
    endpoint: { baseURL: endpoint ?? defaultBaseURL },
    auth: AuthOptions.bearer(input, "NEURATAL_API_KEY"),
    headers: { "X-Neuratal-Client": "Neuratal-Code-Desktop", ...input.headers },
  })

  const decision = (modelID: string | ModelID) =>
    configured.model<OpenAIProviderOptionsInput>({ id: modelID })

  return { id, decision, configure }
}

export const provider = configure()
export const decision = provider.decision

export const decisionModel = (
  modelID: string,
  { apiKey, baseURL, body }: Settings = {},
) =>
  configure({ apiKey, baseURL, http: body === undefined ? undefined : { body } }).decision(modelID)

export * as Neuratal from "./neuratal.js"
