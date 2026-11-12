import { onCleanup, onMount, Show } from "solid-js"
import { createMediaQuery } from "@solid-primitives/media"
import { warmNewSessionRoute, warmSessionRoute } from "@/shell/routes/warm"
import { ScrollView } from "@opencode/ui/scroll-view"
import { createHomeController } from "./model"
import { createHomeProjectsController } from "./projects/controller"
import { createHomeScrollController } from "./scroll"
import { createHomeSessionSearchController } from "./sessions/search"
import { createHomeSessionsController } from "./sessions/controller"
import { HomeSessions } from "./sessions/region"
import { HomeStudioHero } from "./studio/hero"
import "./route.css"

export function Home() {
  const home = createHomeController()
  const projects = createHomeProjectsController(home)
  const sessions = createHomeSessionsController(home)
  const search = createHomeSessionSearchController(home, sessions)
  const scroll = createHomeScrollController()
  const mobile = createMediaQuery("(max-width: 767px)")

  // The welcome screen is where flows start, so load its screen module while it
  // is idle. The chat module is larger; fetch it after the first is in place.
  onMount(() => {
    let idleHandle: number | undefined
    let startHandle: ReturnType<typeof setTimeout> | undefined
    let sessionHandle: ReturnType<typeof setTimeout> | undefined

    const start = () => {
      void warmNewSessionRoute().catch(() => undefined)
      sessionHandle = setTimeout(() => void warmSessionRoute().catch(() => undefined), 1500)
    }

    if (typeof globalThis.requestIdleCallback === "function") {
      idleHandle = globalThis.requestIdleCallback(start, { timeout: 2000 })
    } else {
      startHandle = setTimeout(start, 150)
    }

    onCleanup(() => {
      if (idleHandle !== undefined) globalThis.cancelIdleCallback?.(idleHandle)
      if (startHandle) clearTimeout(startHandle)
      if (sessionHandle) clearTimeout(sessionHandle)
    })
  })

  return (
    <div
      data-slot="home-panel"
      class={`
        nrtl-deck mx-[var(--shell-inline-inset,8px)] mb-[var(--shell-bottom-inset,8px)] mt-[var(--shell-top-inset,8px)] flex min-h-0 flex-1 flex-col self-stretch overflow-hidden rounded-[14px]
        bg-v2-background-bg-base
      `}
    >
      <div data-slot="home-layout" class="nrtl-home-layout">
        <Show when={mobile()}>
          <HomeSessions sessions={sessions} search={search} />
        </Show>
        <div data-slot="home-main" class="nrtl-home-main">
          <ScrollView
            class="min-h-0 flex-1 [container-type:size]"
            viewportRef={scroll.viewport.setViewport}
          >
            <div class="mx-auto flex min-h-full w-full max-w-[1000px] flex-col px-3 pb-16 md:px-6 lg:px-8">
              <HomeStudioHero home={home} projects={projects} scroll={scroll} />
            </div>
          </ScrollView>
        </div>
      </div>
    </div>
  )
}
