import { type Accessor, createMemo } from "solid-js"
import { createSimpleContext } from "@opencode/ui/context"
import { useProviders } from "@/providers/catalog/providers"
import { useGlobal } from "@/runtime/server/runtime"

/**
 * A model's identity in the catalog: provider + model id.
 *
 * This is the key used across the catalog layer (`useModels`) for visibility,
 * favorites, recents and the persisted per-model variant preference. It does
 * not carry a variant: variant is resolved separately per session/agent.
 */
export type ModelKey = { providerID: string; modelID: string }

type Visibility = "show" | "hide"

const RECENT_LIMIT = 5

// luxon's diffNow().as("months") used an average month; keep the same window.
const sixMonths = 6 * 30.436875 * 24 * 60 * 60 * 1000

function modelKey(model: ModelKey) {
  return `${model.providerID}:${model.modelID}`
}

/**
 * Whether a model is free to use. OpenCode's own providers (neuratal / opencode)
 * offer free models regardless of listed price.
 */
export const isFreeModel = (model: { provider: { id: string }; cost?: { input: number } }) =>
  (model.provider.id === "neuratal" || model.provider.id === "opencode") && (!model.cost || model.cost.input === 0)

/**
 * The newest release of each model family per provider. A free model shares its
 * family and release date with its paid twin, so the two are grouped apart. A
 * tie keeps the first model listed.
 *
 * Returns `{ providerID, modelID }` keys suitable for `useModels().find` /
 * `useModels().visible`.
 */
export function latestModels<T extends { id: string; provider: { id: string }; family?: string; release_date: string }>(
  models: T[],
) {
  return [...Map.groupBy(models, (x) => x.provider.id).values()].flatMap((provider) =>
    [...Map.groupBy(provider, (x) => `${x.family}:${isFreeModel(x)}`).values()].map((group) => {
      const first = group.reduce((best, x) => (x.release_date > best.release_date ? x : best))

      return { modelID: first.id, providerID: first.provider.id }
    }),
  )
}

/**
 * Deduplicates `[{ providerID, modelID }, ...]` in place, keeping the first
 * occurrence of each key.
 */
export function uniqueModels(models: ModelKey[]) {
  const seen = new Set<string>()

  return models.filter((model) => {
    const key = modelKey(model)

    if (seen.has(key)) return false
    seen.add(key)

    return true
  })
}

/**
 * Builds the model catalog controller.
 *
 * This is the **catalog layer**: it knows every model the connected providers
 * offer, which are visible/hidden, which are favorites or recents, and the
 * persisted per-model variant preference. Use it to browse the catalog and to
 * flip global model preferences.
 *
 * Use {@link useLocal} (`useLocal().model`) instead for the **session
 * selection layer**: which model is currently selected for the active
 * session/agent, changing it, and resolving the variant for this session.
 */
const createModelsController = (directory: Accessor<string | undefined>) => {
  const providers = useProviders(() => directory())
  const models = useGlobal().models
  const store = models.store
  const setStore = models.set

  const available = createMemo(() =>
    providers.connected().flatMap((p) =>
      Object.values(p.models).map((m) => ({
        ...m,
        provider: p,
      })),
    ),
  )

  // Release dates as epoch ms; an unparseable date is NaN and never counts as recent.
  const release = createMemo(
    () =>
      new Map(
        available().map(
          (model) =>
            [modelKey({ providerID: model.provider.id, modelID: model.id }), Date.parse(model.release_date)] as const,
        ),
      ),
  )

  const latest = createMemo(() =>
    latestModels(
      available().filter((x) => {
        const released = release().get(modelKey({ providerID: x.provider.id, modelID: x.id })) ?? NaN

        return Math.abs(Date.now() - released) < sixMonths
      }),
    ),
  )

  const latestSet = createMemo(() => new Set(latest().map((x) => modelKey(x))))

  // OpenCode's free models (Big Pickle) stay on offer long after release, so they are listed regardless of age or a
  // newer free model in the same family.
  const freeSet = createMemo(
    () =>
      new Set(
        available()
          .filter(isFreeModel)
          .map((x) => modelKey({ providerID: x.provider.id, modelID: x.id })),
      ),
  )

  const visibility = createMemo(() => {
    const map = new Map<string, Visibility>()

    for (const item of store.user) map.set(`${item.providerID}:${item.modelID}`, item.visibility)

    return map
  })

  const list = createMemo(() =>
    available().map((m) => ({
      ...m,
      name: m.name.replace("(latest)", "").trim(),
      latest: m.name.includes("(latest)"),
    })),
  )

  /**
   * Finds a catalog model item by key. Returns `undefined` when the model is no
   * longer offered by any connected provider.
   */
  const find = (key: ModelKey) => list().find((m) => m.id === key.modelID && m.provider.id === key.providerID)

  function update(model: ModelKey, state: Visibility) {
    const index = store.user.findIndex((x) => x.modelID === model.modelID && x.providerID === model.providerID)

    if (index >= 0) {
      setStore("user", index, (current) => ({ ...current, visibility: state }))

      return
    }

    setStore("user", store.user.length, { ...model, visibility: state })
  }

  /**
   * Whether `model` is visible in the catalog. Explicit `show`/`hide` wins;
   * otherwise neuratal models, latest models, free models and undated models are
   * visible by default.
   */
  const visible = (model: ModelKey) => {
    const key = modelKey(model)
    const state = visibility().get(key)

    if (state === "hide") return false

    if (state === "show") return true

    if (model.providerID === "neuratal") return true

    if (latestSet().has(key) || freeSet().has(key)) return true

    // Models without a parseable release date stay visible.
    return !Number.isFinite(release().get(key) ?? NaN)
  }

  /**
   * Sets a model's visibility. Persisted per server globally.
   */
  const setVisibility = (model: ModelKey, state: boolean) => {
    update(model, state ? "show" : "hide")
  }

  const push = (model: ModelKey) => {
    const uniq = uniqueModels([model, ...store.recent])

    if (uniq.length > RECENT_LIMIT) uniq.pop()
    setStore("recent", uniq)
  }

  // Newest favorite first, as in the TUI.
  const toggleFavorite = (model: ModelKey) => {
    const key = modelKey(model)
    const rest = store.favorite.filter((item) => modelKey(item) !== key)

    setStore(
      "favorite",
      rest.length === store.favorite.length
        ? [{ providerID: model.providerID, modelID: model.modelID }, ...rest]
        : rest,
    )
  }

  const variantKey = (model: ModelKey) => `${model.providerID}/${model.modelID}`
  const getVariant = (model: ModelKey) => store.variant?.[variantKey(model)]

  /**
   * Sets the persisted per-model variant preference (the default variant shown
   * unless a session picks another). Stored per server globally.
   */
  const setVariant = (model: ModelKey, value: string | undefined) => {
    const key = variantKey(model)

    if (!store.variant) {
      setStore("variant", { [key]: value ?? "default" })

      return
    }

    setStore("variant", key, value ?? "default")
  }

  return {
    ready: models.ready,
    /** Every catalog model offered by connected providers. */
    list,
    /** Finds a catalog model item by `{ providerID, modelID }`, or `undefined`. */
    find,
    /** Whether a model is visible in the catalog. */
    visible,
    /** Shows or hides a model in the catalog (persisted). */
    setVisibility,
    recent: {
      list: models.recent,
      /** Adds a model to the recent list (most recent first, capped at 5). */
      push,
    },
    favorite: {
      list: models.favorite,
      /** Toggles a model's favorite state (newest favorite first). */
      toggle: toggleFavorite,
    },
    variant: {
      /** The persisted default variant for a model, or `undefined`. */
      get: getVariant,
      /** Sets the persisted default variant for a model. */
      set: setVariant,
    },
  }
}

export const { use: useModels, provider: ModelsProvider } = createSimpleContext({
  name: "Models",
  gate: false,
  init: (props: { directory?: string } = {}) => {
    return createModelsController(() => props.directory)
  },
})
