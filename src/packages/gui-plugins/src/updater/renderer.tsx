import { showToast } from "@opencode/ui/toast"
import { Command, TitlebarItem, type SetupContext, type Plugin } from "@opencode/plugin/gui"
import { Updater } from "@opencode/plugin/gui/updater"
import { updaterAction } from "./action"
import type definition from "./index"

const setup: Plugin.Setup<typeof definition> = (ctx) => {
  whatsNew(ctx)

  if (!ctx.desktop) return
  const updater = ctx.main(Updater)
  // Undefined until main's updater is up and has sent its state, and again while it is gone.
  const state = () => updater.state()

  const act = (name: "check" | "install") => {
    if (state()) return void import("./actions").then((module) => module[name](ctx, updater))

    // Not loaded yet, or not active (failed, or not on this platform): nothing can check or install.
    showToast({ title: ctx.t("common.requestFailed") })
  }

  ctx.add(TitlebarItem, () => {
    const current = state()
    const installing = current?.status === "installing"
    const ready = current?.status === "ready" || current?.status === "download-required"

    if (!ready && !installing) return

    return {
      id: "update",
      label: ctx.t("status.label"),
      title: ctx.t(updaterAction(current).label),
      busy: installing,
      run: () => act("install"),
    }
  })

  ctx.add(Command, (): Command => ({ id: "check", title: ctx.t("menu.check"), hidden: true, run: () => act("check") }))

  // Beta builds answer the app menu's Check for Updates in the focused window instead of a native dialog. The
  // listener follows main's updater across restarts.
  updater.on("check", () => act("check"))
}

/**
 * What's New after an update, on every platform: the release highlights since the version last seen, or on beta the
 * features and fixes of the beta builds since then. The first run and a disabled What's New only remember the version.
 */
function whatsNew(ctx: SetupContext<typeof definition>) {
  const version = ctx.app.version
  const seen = ctx.stores.seen
  const previous = seen.value.version

  if (!version || previous === version) return

  const commit = import.meta.env.OPENCODE_COMMIT
  const previousCommit = seen.value.commit

  const markSeen = () =>
    seen.update((draft) => {
      draft.version = version

      // Beta remembers the build's commit even when nothing shows, so the next update lists what came after it.
      if (commit) draft.commit = commit
    })

  if (!previous || !ctx.stores.releaseNotes.value.enabled) return markSeen()

  if (ctx.app.channel === "beta") {
    void import("./beta-dialog").then((module) => {
      if (ctx.signal.aborted) return

      module.showBetaNotes(ctx, { previous, previousCommit, markSeen })
    })

    return
  }

  void import("./whats-new").then((module) => {
    if (ctx.signal.aborted) return

    module.showWhatsNew(ctx, { previous, current: version, markSeen })
  })
}

export default setup
