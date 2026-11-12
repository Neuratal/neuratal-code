import { For, Show, createMemo, createSignal } from "solid-js"
import { useLocal, type ModelSelection } from "@/providers/models/selection"
import { useModels } from "@/providers/models/models"
import { isFreeModel } from "@/providers/models/models"
import { ProviderModelIcon } from "@/providers/models/provider-group"
import { popularProviders } from "@/providers/catalog/order"
import { Dialog, DialogBody, DialogFooter, DialogHeader, DialogTitleGroup } from "@opencode/ui/dialog"
import { Badge } from "@opencode/ui/badge"
import { Icon } from "@opencode/ui/icon"
import { TextInput } from "@opencode/ui/text-input"
import { useLanguage } from "@/runtime/i18n/language"
import "./model-picker.css"

type ModelItem = ReturnType<ReturnType<typeof useModels>["list"]>[number]

type ProviderGroup = {
  providerID: string
  providerName: string
  provider: ModelItem["provider"]
  items: ModelItem[]
  popular: boolean
}

const modelKey = (model: ModelItem) => `${model.provider.id}:${model.id}`

const sparklesIcon = (
  <svg viewBox="0 0 16 16" fill="none" class="size-4 shrink-0" aria-hidden="true">
    <path
      d="M8 1.5l1.65 4.35L14 7.5l-4.35 1.65L8 13.5l-1.65-4.35L2 7.5l4.35-1.65L8 1.5z"
      stroke="currentColor"
      stroke-linejoin="round"
    />
  </svg>
)

const apertureIcon = (
  <svg viewBox="0 0 16 16" fill="none" class="size-4 shrink-0" aria-hidden="true">
    <circle cx="8" cy="8" r="6" stroke="currentColor" />
    <path
      d="M8 1.5l2.6 4.5M8 14.5L5.4 10M1.5 8l4.5-2.6M14.5 8l-4.5 2.6M3.5 3.5l3.2 3.2M12.5 12.5L9.3 9.3"
      stroke="currentColor"
      stroke-linecap="round"
    />
  </svg>
)

/**
 * ModelPickerDialog — Neuratal Aurora model chooser.
 *
 * En üstte Neuratal'ın kendi modelleri (Kazahana / Akisame / Hatsukaze), altında
 * sağlayıcılara göre gruplanmış modeller. Sekmeli yapı: Basic / Advanced.
 *
 * - `model` — the current session's model selection (`useLocal().model`).
 * - `onSelect` — called once a model is picked; closes the dialog.
 * - `provider` — optional provider id to pre-filter the list.
 */
export function ModelPickerDialog(props: { model?: ModelSelection; onSelect?: () => void; provider?: string }) {
  const language = useLanguage()
  const dialog = props.model ?? useLocal().model
  const models = useModels()
  const [activeTab, setActiveTab] = createSignal<"basic" | "advanced">("basic")
  const [search, setSearch] = createSignal("")

  const all = createMemo(() => models.list())

  // Neuratal'ın kendi modelleri (neuratal provider'ı) — en üstte listelenir.
  const ourModels = createMemo(() => all().filter((item) => item.provider.id === "neuratal"))

  // Diğer sağlayıcılardan gelen modeller — sağlayıcıya göre gruplanmış.
  const providerGroups = createMemo((): ProviderGroup[] => {
    const list = all().filter((item) => item.provider.id !== "neuratal")

    if (props.provider) {
      const filtered = list.filter((item) => item.provider.id === props.provider)
      const first = filtered[0]

      if (!first) return []
      return [
        {
          providerID: props.provider,
          providerName: first.provider.name,
          provider: first.provider,
          items: filtered,
          popular: popularProviders.includes(props.provider),
        },
      ]
    }

    const byProvider = new Map<string, ModelItem[]>()

    for (const item of list) {
      const existing = byProvider.get(item.provider.id)
      if (existing) existing.push(item)
      else byProvider.set(item.provider.id, [item])
    }

    return Array.from(byProvider.entries())
      .map(([providerID, items]) => {
        const first = items[0]
        return {
          providerID,
          providerName: first.provider.name,
          provider: first.provider,
          items,
          popular: popularProviders.includes(providerID),
        }
      })
      .sort((a, b) => {
        if (a.popular && !b.popular) return -1
        if (!a.popular && b.popular) return 1
        return a.providerName.localeCompare(b.providerName)
      })
  })

  const filteredOur = createMemo(() => {
    const q = search().trim().toLowerCase()
    if (!q) return ourModels()
    return ourModels().filter((item) => item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q))
  })

  const filteredGroups = createMemo((): ProviderGroup[] => {
    const q = search().trim().toLowerCase()
    if (!q) {
      if (activeTab() === "basic") {
        return providerGroups().filter((group) => group.popular)
      }
      return providerGroups()
    }

    return providerGroups()
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.id.toLowerCase().includes(q) ||
            group.providerName.toLowerCase().includes(q),
        ),
      }))
      .filter((group) => group.items.length > 0)
  })

  const selectedKey = createMemo(() => {
    const key = dialog.key()
    return key ? `${key.providerID}:${key.modelID}` : undefined
  })

  const isSelected = (item: ModelItem) => modelKey(item) === selectedKey()

  const select = (item: ModelItem) => {
    dialog.set({ providerID: item.provider.id, modelID: item.id }, { recent: true })
    props.onSelect?.()
  }

  const variantLabel = (item: ModelItem) => {
    const current = dialog.current()
    if (!current || current.provider.id !== item.provider.id || current.id !== item.id) return
    return dialog.variant.current({ providerID: item.provider.id, modelID: item.id })
  }

  const hasAnything = () => filteredOur().length > 0 || filteredGroups().some((group) => group.items.length > 0)

  return (
    <Dialog size="large" variant="settings" class="model-picker-dialog">
      <DialogHeader hideClose={false} closeLabel={language.t("common.close")}>
        <DialogTitleGroup
          title={language.t("dialog.model.select.title")}
          description={language.t("dialog.model.select.description")}
        />
      </DialogHeader>
      <DialogBody class="flex min-h-0 flex-col">
        <div class="model-picker-body flex min-h-0 flex-1 flex-col">
          <div class="model-picker-segmented-wrap mb-4">
            <div role="tablist" class="model-picker-segmented" aria-label={language.t("dialog.model.tabs.group")}>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab() === "basic"}
                data-state={activeTab() === "basic" ? "active" : "active-inactive"}
                class="model-picker-segment"
                onClick={() => setActiveTab("basic")}
              >
                {sparklesIcon}
                {language.t("dialog.model.tabs.basic")}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab() === "advanced"}
                class="model-picker-segment"
                data-state={activeTab() === "advanced" ? "active" : "active-inactive"}
                onClick={() => setActiveTab("advanced")}
              >
                {apertureIcon}
                {language.t("dialog.model.tabs.advanced")}
              </button>
            </div>
          </div>

          <div class="model-picker-search-wrap mb-3">
            <TextInput
              type="search"
              appearance="base"
              class="!w-full"
              leadingIcon={<Icon name="magnifying-glass" size="small" />}
              placeholder={language.t("dialog.model.search.placeholder")}
              value={search()}
              onInput={(event) => setSearch(event.currentTarget.value)}
              onClearClick={() => setSearch("")}
              showClearButton={!!search()}
              clearIcon="circle-xmark"
              clearLabel={language.t("common.clear")}
              aria-label={language.t("dialog.model.search.placeholder")}
            />
          </div>

          <Show when={!hasAnything()}>
            <div class="model-picker-empty">
              <Icon name="magnifying-glass" size="large" class="mb-3 opacity-30" />
              <p class="text-v2-text-text-muted">{language.t("dialog.model.empty")}</p>
            </div>
          </Show>
          <Show when={hasAnything()}>
            <div class="model-picker-scroll" data-scrollable>
              <Show when={filteredOur().length > 0}>
                <div class="model-picker-our-section">
                  <div class="model-picker-section-label">{language.t("dialog.model.section.neuratal")}</div>
                  <ul class="model-picker-list">
                    <For each={filteredOur()}>
                      {(item) => (
                        <li>
                          <ModelRow
                            item={item}
                            selected={isSelected(item)}
                            onSelect={() => select(item)}
                            variant={variantLabel(item)}
                            language={language}
                          />
                        </li>
                      )}
                    </For>
                  </ul>
                </div>
              </Show>

              <div class="model-picker-groups">
                <For each={filteredGroups()}>
                  {(group) => (
                    <div class="model-picker-group">
                      <div class="model-picker-group-header">
                        <ProviderModelIcon provider={group.provider} class="size-4 shrink-0" />
                        <span class="model-picker-group-name">{group.providerName}</span>
                      </div>
                      <ul class="model-picker-list">
                        <For each={group.items}>
                          {(item) => (
                            <li>
                              <ModelRow
                                item={item}
                                selected={isSelected(item)}
                                onSelect={() => select(item)}
                                variant={variantLabel(item)}
                                language={language}
                              />
                            </li>
                          )}
                        </For>
                      </ul>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>
        </div>
      </DialogBody>
      <DialogFooter>
        <div class="model-picker-footer">
          <div class="flex min-w-0 items-center gap-3">
            <span class="min-w-0 flex items-center gap-1.5 truncate text-[13px] text-v2-text-text-muted">
              {language.t("dialog.model.useMultiple")}
              <span class="shrink-0 rounded-[4px] border border-white/10 bg-white/[0.04] px-1 py-0.5 text-[9px] font-bold uppercase leading-[12px] text-v2-text-text-faint">
                {language.t("dialog.model.useMultiple.soon")}
              </span>
            </span>
            <span class="truncate text-[13px] text-v2-text-text-muted">
              {language.t("dialog.model.useMultiple.description")}
            </span>
          </div>
        </div>
      </DialogFooter>
    </Dialog>
  )
}

function ModelRow(props: {
  item: ModelItem
  selected: boolean
  onSelect: () => void
  variant: string | undefined
  language: ReturnType<typeof useLanguage>
}) {
  const item = props.item

  return (
    <button
      type="button"
      class="model-picker-row"
      classList={{ "model-picker-row--selected": props.selected }}
      onClick={props.onSelect}
      aria-pressed={props.selected}
    >
      <div class="model-picker-icon">
        <ProviderModelIcon provider={item.provider} model={item} class="size-6 shrink-0" />
      </div>
      <div class="model-picker-copy">
        <div class="model-picker-name">{item.name}</div>
        <div class="model-picker-meta">
          <span class="model-picker-provider">{item.provider.name}</span>
          <Show when={isFreeModel(item)}>
            <Badge appearance="compact" variant="subtle" class="model-picker-badge">
              {props.language.t("model.tag.free")}
            </Badge>
          </Show>
          <Show when={item.latest}>
            <Badge appearance="compact" variant="subtle" class="model-picker-badge">
              {props.language.t("model.tag.latest")}
            </Badge>
          </Show>
          <Show when={!props.selected && props.variant}>
            <span class="capitalize text-v2-text-text-faint">{props.variant}</span>
          </Show>
        </div>
      </div>
      <Show when={props.selected}>
        <span class="model-picker-dot" aria-hidden="true" />
      </Show>
    </button>
  )
}
