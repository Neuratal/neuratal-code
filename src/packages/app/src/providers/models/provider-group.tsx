import { Badge } from "@opencode/ui/badge"
import { Icon } from "@opencode/ui/icon"
import { IconButton } from "@opencode/ui/icon-button"
import { iconNames } from "@opencode/ui/icons/provider"
import { providerIconBodies } from "@opencode/ui/icons/provider-brand"
import { Menu } from "@opencode/ui/menu"
import { Nura } from "@opencode/ui/nura"
import type { JSX } from "solid-js"
import { createMemo, For, Match, Show, Switch } from "solid-js"
import { consoleProviderGroup, consoleProviderName } from "@/providers/catalog/console"
import { NeuratalLogo } from "@/providers/neuratal-logo"
import { useLanguage } from "@/runtime/i18n/language"
import "@/settings/settings.css"

type ModelProvider = { id: string; canonical?: string; name: string }

type ModelBrand = { id?: string; family?: string }

type ModelItem = { provider: ModelProvider & { integrationID?: string }; cost?: { input: number } }

type ModelGroup<T> = { category: string; items: T[] }

export const CONSOLE_GROUP_KEY = "console:opencode"

function FallbackAvatar(props: { provider: ModelProvider; class?: string }) {
  const words = () => props.provider.name.trim().split(/\s+/u).filter(Boolean)
  const initials = () => {
    const list = words()

    if (list.length === 0) return "?"
    if (list.length === 1) return list[0].slice(0, 2).toUpperCase()
    return `${list[0][0] ?? ""}${list[1][0] ?? ""}`.toUpperCase()
  }
  const hash = () => {
    let value = 0

    for (const ch of props.provider.name) value = (value * 31 + ch.charCodeAt(0)) | 0
    return Math.abs(value)
  }
  const hue = () => hash() % 360
  const bg = () => `hsl(${hue()} 55% 24%)`
  const fg = () => `hsl(${hue()} 80% 78%)`

  return (
    <span
      data-component="provider-initials-avatar"
      class={props.class}
      style={{
        display: "inline-flex",
        "align-items": "center",
        "justify-content": "center",
        "border-radius": "999px",
        background: bg(),
        color: fg(),
        "font-weight": "700",
        "font-size": "10px",
        "line-height": "1",
        "letter-spacing": "0.02em",
        "flex-shrink": "0",
        "min-width": "0",
        "min-height": "0",
      }}
      aria-hidden="true"
    >
      {initials()}
    </span>
  )
}

const iconNameSet = new Set<string>(iconNames)

// Sprite ikonlarının renkleri `fill="currentColor"` üzerinden geliyor; marka rengi
// vermezsek hepsi tek renkli (siyah) görünür. Her bilinen sprite id'sine canlı
// marka rengini eşliyoruz.
const brandColors: Record<string, string> = {
  anthropic: "#d97757",
  openai: "#10a37f",
  google: "#4285f4",
  "google-vertex": "#4285f4",
  "google-vertex-anthropic": "#d97757",
  deepseek: "#4d6bfe",
  deepinfra: "#fb923c",
  meta: "#0866ff",
  llama: "#0668e1",
  mistral: "#ff7000",
  moonshotai: "#f05a28",
  "moonshotai-cn": "#f05a28",
  minimax: "#f43b47",
  "minimax-cn": "#f43b47",
  "minimax-coding-plan": "#f43b47",
  "minimax-cn-coding-plan": "#f43b47",
  zhipuai: "#2f6fec",
  "zhipuai-coding-plan": "#2f6fec",
  zai: "#2f6fec",
  "zai-coding-plan": "#2f6fec",
  xiaomi: "#ff6900",
  xai: "currentColor",
  groq: "#f55036",
  cohere: "#39594d",
  huggingface: "#ffd21e",
  "ollama-cloud": "currentColor",
  openrouter: "#6467f2",
  "aliyun-cn": "#ff6a00",
  alibaba: "#ff6a00",
  "alibaba-cn": "#ff6a00",
  "302ai": "#3b82f6",
  abacus: "#7c3aed",
  aihubmix: "#6366f1",
  "amazon-bedrock": "#ff9900",
  azure: "#0078d4",
  "azure-cognitive-services": "#0078d4",
  bailing: "#f97316",
  baseten: "#ff5a5f",
  berget: "#f97316",
  cerebras: "#f93822",
  chutes: "#ff6633",
  "cloudflare-ai-gateway": "#f48120",
  "cloudflare-workers-ai": "#f48120",
  "cloudferro-sherlock": "#22c55e",
  cortecs: "#a855f7",
  digitalocean: "#0080ff",
  evroc: "#10b981",
  fastrouter: "#8b5cf6",
  "fireworks-ai": "#ff4b4b",
  firmware: "#9ca3af",
  friendli: "#14b8a6",
  gitlab: "#fc6d26",
  "github-copilot": "#6e40c9",
  "github-models": "#6e40c9",
  helicone: "#6366f1",
  iflowcn: "#3b82f6",
  inception: "#22d3ee",
  inference: "#a78bfa",
  "io-net": "#14b8a6",
  jiekou: "#6366f1",
  "kimi-for-coding": "#6366f1",
  kilo: "#3b82f6",
  "kuae-cloud-coding-plan": "#ef4444",
  lmstudio: "#22c55e",
  lucidquery: "#6366f1",
  meganova: "#f97316",
  meituan: "#fbfb00",
  moark: "#3b82f6",
  modelscope: "#6366f1",
  morph: "#8b5cf6",
  "nano-gpt": "#facc15",
  nebius: "#3b82f6",
  nvidia: "#76B900",
  nova: "#22c55e",
  "novita-ai": "#3b82f6",
  "opencode-go": "#7c5cff",
  opencode: "#7c5cff",
  ovhcloud: "#1d4ed8",
  perplexity: "#20b2aa",
  poe: "#6366f1",
  "privatemode-ai": "#22c55e",
  "qihang-ai": "#3b82f6",
  "qiniu-ai": "#f43f5e",
  reflection: "#8b5cf6",
  requesty: "#f97316",
  "sap-ai-core": "#f97316",
  scaleway: "#4f46e5",
  siliconflow: "#f43f5e",
  "siliconflow-cn": "#f43f5e",
  stackit: "currentColor",
  stepfun: "#7c3aed",
  submodel: "#6366f1",
  synthetic: "#9ca3af",
  togetherai: "#0066ff",
  upstage: "#6366f1",
  v0: "currentColor",
  venice: "#22c55e",
  vercel: "currentColor",
  vivgrid: "#22d3ee",
  vultr: "#007bfc",
  wandb: "#ffbe0b",
}

function colorFor(id: string) {
  return brandColors[id] ?? "#a5b4fc"
}

// Provider'ların canonical/id'sini sprite'taki en uzun eşleşen id'ye çevirir
// (örn. "nvidia-nim" → "nvidia", "alibaba-cloud-cn" → "alibaba-cn").
function resolveSpriteId(provider: ModelProvider) {
  const candidates = [provider.canonical, provider.canonical?.replace(/-token-plan$/, ""), provider.id]
    .filter((value): value is string => !!value)
    .map((value) => value.toLowerCase())

  for (const candidate of candidates) {
    if (iconNameSet.has(candidate)) return candidate
  }

  let best: string | undefined

  for (const candidate of candidates) {
    for (const icon of iconNames) {
      if (candidate.startsWith(icon) && (!best || icon.length > best.length)) best = icon
    }
  }

  return best
}

// OpenCode hosts models from many vendors behind a single provider, so its rows
// need the model vendor's mark instead of the provider's own logo. Other
// providers are marketplaces or single-vendor, where the provider icon is right.
const marketplaceProviders = new Set(["opencode", "opencode-go"])

const modelBrands: ReadonlyArray<{ icon: string; prefixes: readonly string[] }> = [
  { icon: "anthropic", prefixes: ["claude", "anthropic"] },
  { icon: "openai", prefixes: ["gpt", "o1", "o3", "o4", "openai"] },
  { icon: "google", prefixes: ["gemini", "gemma"] },
  { icon: "deepseek", prefixes: ["deepseek"] },
  { icon: "nvidia", prefixes: ["nemotron"] },
  { icon: "zai", prefixes: ["glm"] },
  { icon: "minimax", prefixes: ["minimax"] },
  { icon: "xiaomi", prefixes: ["mimo"] },
  { icon: "moonshotai", prefixes: ["kimi"] },
  { icon: "alibaba", prefixes: ["qwen", "qvq"] },
  { icon: "meituan", prefixes: ["longcat"] },
  { icon: "stepfun", prefixes: ["step"] },
  { icon: "mistral", prefixes: ["mistral", "codestral", "devstral", "magistral", "ministral", "pixtral", "voxtral"] },
  { icon: "xai", prefixes: ["grok"] },
  { icon: "llama", prefixes: ["llama"] },
  { icon: "meta", prefixes: ["muse"] },
  { icon: "cohere", prefixes: ["north", "command"] },
  { icon: "reflection", prefixes: ["beam"] },
]

function modelBrand(provider: ModelProvider, model?: ModelBrand) {
  if (!model || !marketplaceProviders.has(provider.id)) return

  const candidates = [model.family, model.id]
    .filter((value): value is string => !!value)
    .map((value) => value.toLowerCase())

  for (const brand of modelBrands) {
    const matched = candidates.some((candidate) => brand.prefixes.some((prefix) => candidate.startsWith(prefix)))
    if (matched && iconNameSet.has(brand.icon)) return brand.icon
  }
}

// Some icons carry `fill="currentColor"` on the source root <svg>, which the
// generator drops from the body. When the markup has neither fill nor stroke,
// it relies on that inherited fill and would disappear under fill="none".
function fillFor(body: string) {
  return body.includes("fill=") || body.includes("stroke=") ? "none" : "currentColor"
}

function ProviderSprite(props: { id: string; provider: ModelProvider; class?: string }) {
  return (
    <Show
      when={providerIconBodies[props.id]}
      fallback={<FallbackAvatar provider={props.provider} class={props.class} />}
    >
      {(body) => (
        <svg
          data-component="provider-brand-icon"
          class={props.class}
          viewBox={body().viewBox}
          width={22}
          height={22}
          fill={fillFor(body().body)}
          aria-hidden="true"
          style={{ color: colorFor(props.id) }}
          innerHTML={body().body}
        />
      )}
    </Show>
  )
}

export function ProviderModelIcon(props: { provider: ModelProvider; model?: ModelBrand; class?: string }) {
  const icon = () => resolveSpriteId(props.provider)
  const brand = () => modelBrand(props.provider, props.model)

  return (
    <Switch>
      <Match when={props.provider.id === "neuratal"}>
        <Nura animated={false} size={22} label={props.provider.name} />
      </Match>
      <Match when={brand()} keyed>
        {(id) => <ProviderSprite id={id} provider={props.provider} class={props.class} />}
      </Match>
      <Match when={props.provider.id === "opencode" || props.provider.id === "opencode-go"}>
        <NeuratalLogo class={`size-5 ${props.class ?? ""}`} />
      </Match>
      <Match when={icon()} keyed>
        {(id) => <ProviderSprite id={id} provider={props.provider} class={props.class} />}
      </Match>
      <Match when={true}>
        <FallbackAvatar provider={props.provider} class={props.class} />
      </Match>
    </Switch>
  )
}

/** Detects the Console workspace from every listed model, so a search that hides some providers keeps the group. */
export function consoleModelGroup<T extends ModelItem>(items: readonly T[]) {
  return consoleProviderGroup([...new Map(items.map((item) => [item.provider.id, item.provider])).values()])
}

/** Provider sections for a model list, with Console workspace providers nested under one OpenCode Console section. */
export function ProviderModelSections<T extends ModelItem>(props: {
  groups: ModelGroup<T>[]
  managed: ReturnType<typeof consoleModelGroup<T>>
  expanded: (key: string) => boolean
  disabled: boolean
  onExpandedChange: (key: string, expanded: boolean) => void
  rows: (items: T[]) => JSX.Element
  /** Trailing control in a direct provider's header. */
  action?: (group: ModelGroup<T>) => JSX.Element
  onSetVisibility?: (providerID: string, visible: boolean) => void
  ref?: (providerID: string, element: HTMLElement) => void
}) {
  type Section = {
    group?: ModelGroup<T>
    managed?: { group: NonNullable<ReturnType<typeof consoleModelGroup<T>>>; providers: ModelGroup<T>[] }
  }

  const language = useLanguage()

  const sections = createMemo<Section[]>(() => {
    const managed = props.managed
    const ids = new Set(managed?.providers.map((provider) => provider.id))
    const nested = props.groups.filter((group) => ids.has(group.category))

    if (!managed || nested.length === 0) return props.groups.map((group) => ({ group }))
    const first = props.groups.findIndex((group) => ids.has(group.category))

    return props.groups.flatMap<Section>((group, index) => {
      if (!ids.has(group.category)) return [{ group }]

      if (index !== first) return []

      return [{ managed: { group: managed, providers: nested } }]
    })
  })

  // Only the keyless catalog is free; a Zen key or Console account keeps the provider's own name.
  const name = (group: ModelGroup<T>) =>
    group.category === "opencode" && group.items.every((item) => !item.cost?.input)
      ? language.t("provider.connect.opencode.freeName")
      : group.items[0].provider.name

  function Header(input: { id: string; icon: JSX.Element; title: JSX.Element; badge?: string; action?: JSX.Element }) {
    return (
      <h3 class="settings-models-group-header" classList={{ "justify-between": !!input.action }}>
        <button
          type="button"
          class="settings-models-group-trigger"
          aria-expanded={props.expanded(input.id)}
          disabled={props.disabled}
          onClick={() => props.onExpandedChange(input.id, !props.expanded(input.id))}
        >
          <span class="settings-models-group-chevron">
            <Icon name="chevron-down" size="small" classList={{ collapsed: !props.expanded(input.id) }} />
          </span>
          <span class="settings-models-group-label">
            {input.icon}
            <bdi class="settings-models-group-title">{input.title}</bdi>
            <Show when={input.badge}>{(badge) => <Badge>{badge()}</Badge>}</Show>
          </span>
        </button>
        {input.action}
      </h3>
    )
  }

  return (
    <For each={sections()}>
      {(section) => (
        <Show
          when={section.managed}
          fallback={
            <Show when={section.group}>
              {(group) => (
                <section
                  ref={(element) => props.ref?.(group().category, element)}
                  class="settings-section"
                  data-component="settings-models-provider"
                  data-expanded={props.expanded(group().category) ? "" : undefined}
                >
                  <Header
                    id={group().category}
                    icon={<ProviderModelIcon provider={group().items[0].provider} class="shrink-0" />}
                    title={name(group())}
                    action={props.action?.(group())}
                  />
                  <Show when={props.expanded(group().category)}>{props.rows(group().items)}</Show>
                </section>
              )}
            </Show>
          }
        >
          {(managed) => (
            <section
              class="settings-section"
              data-component="settings-models-console"
              data-expanded={props.expanded(CONSOLE_GROUP_KEY) ? "" : undefined}
            >
              <Header
                id={CONSOLE_GROUP_KEY}
                icon={<NeuratalLogo class="size-4 shrink-0" />}
                title={language.t("provider.connect.opencode.name")}
                badge={managed().group.workspace}
              />
              <Show when={props.expanded(CONSOLE_GROUP_KEY)}>
                <div class="provider-model-groups settings-models-console-groups">
                  <For each={managed().providers}>
                    {(group) => (
                      <ProviderModelGroup
                        ref={(element) => props.ref?.(group.category, element)}
                        provider={group.items[0].provider}
                        name={consoleProviderName(managed().group, group.items[0].provider.name)}
                        expanded={props.expanded(group.category)}
                        disabled={props.disabled}
                        onSetVisibility={
                          props.onSetVisibility
                            ? (visible) => props.onSetVisibility?.(group.category, visible)
                            : undefined
                        }
                        onExpandedChange={(value) => props.onExpandedChange(group.category, value)}
                      >
                        {props.rows(group.items)}
                      </ProviderModelGroup>
                    )}
                  </For>
                </div>
              </Show>
            </section>
          )}
        </Show>
      )}
    </For>
  )
}

export function ProviderModelGroup(props: {
  provider: ModelProvider
  name?: string
  expanded: boolean
  disabled?: boolean
  onSetVisibility?: (visible: boolean) => void
  children: JSX.Element
  ref?: (element: HTMLElement) => void
  onExpandedChange: (expanded: boolean) => void
}) {
  const language = useLanguage()

  return (
    <section
      ref={props.ref}
      class="provider-model-group"
      data-component="provider-model-group"
      data-provider={props.provider.id}
      data-expanded={props.expanded ? "" : undefined}
    >
      <h3 class="provider-model-group-header">
        <button
          type="button"
          class="provider-model-group-trigger"
          aria-expanded={props.expanded}
          disabled={props.disabled}
          onClick={() => props.onExpandedChange(!props.expanded)}
        >
          <span class="provider-model-group-label">
            <ProviderModelIcon provider={props.provider} class="shrink-0" />
            <bdi class="provider-model-group-title">{props.name ?? props.provider.name}</bdi>
            <Icon
              name="chevron-down"
              size="small"
              classList={{ "provider-model-group-chevron": true, collapsed: !props.expanded }}
            />
          </span>
        </button>
        <Show when={props.onSetVisibility} keyed>
          {(setVisibility) => (
            <div class="provider-model-group-actions">
              <Menu gutter={4} modal={false} placement="bottom-end">
                <Menu.Trigger
                  as={IconButton}
                  variant="ghost-muted"
                  size="small"
                  icon={<Icon name="outline-dots" />}
                  aria-label={language.t("common.moreOptions")}
                />
                <Menu.Portal>
                  <Menu.Content>
                    <Menu.Item onSelect={() => setVisibility(true)}>
                      {language.t("settings.models.enableAll")}
                    </Menu.Item>
                    <Menu.Item onSelect={() => setVisibility(false)}>
                      {language.t("settings.models.disableAll")}
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Portal>
              </Menu>
            </div>
          )}
        </Show>
      </h3>
      <Show when={props.expanded}>
        <div class="provider-model-group-models">{props.children}</div>
      </Show>
    </section>
  )
}
