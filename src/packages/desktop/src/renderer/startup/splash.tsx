import { onCleanup, onMount, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { Wordmark } from "@opencode/ui/wordmark"
import type { Platform } from "@opencode/app/desktop"
import { Nura } from "@opencode/ui/nura"
import "./splash.css"

export function LoadingSplash(props: {
  deep: boolean
  firstLaunch: boolean
  platform: Platform
  preview: boolean
  onDrawEnd: () => void
}) {
  const [drawing, setDrawing] = createStore({ started: false })
  onMount(() => {
    if (!props.preview || !props.firstLaunch) return
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")

    const start = () => {
      if (document.visibilityState !== "visible" || !document.hasFocus()) return
      setDrawing("started", true)

      if (motion.matches) props.onDrawEnd()
    }

    window.addEventListener("focus", start)
    document.addEventListener("visibilitychange", start)
    motion.addEventListener("change", start)
    start()
    onCleanup(() => {
      window.removeEventListener("focus", start)
      document.removeEventListener("visibilitychange", start)
      motion.removeEventListener("change", start)
    })
  })

  const titlebarHeight = () => {
    const zoom = props.platform.webviewZoom?.() ?? 1

    if (props.platform.os === "macos") return `max(36px, ${36 / zoom}px)`

    if (props.platform.os === "windows")
      return `max(36px, env(titlebar-area-height, ${44 / Math.min(Math.max(zoom, 0.25), 1)}px))`

    return "36px"
  }

  return (
    <Show
      when={props.firstLaunch}
      fallback={
        <div data-component="startup-splash" class="startup-splash h-dvh w-screen">
          {/* Aurora background */}
          <div class="startup-splash__aurora" aria-hidden="true">
            <span class="startup-splash__blob startup-splash__blob--a" />
            <span class="startup-splash__blob startup-splash__blob--b" />
            <span class="startup-splash__blob startup-splash__blob--c" />
            <span class="startup-splash__stars" />
            <span class="startup-splash__grid" />
          </div>

          <div class="startup-splash__content">
            {/* Nura with glow ring */}
            <div class="startup-splash__nura-wrap">
              <span class="startup-splash__ring startup-splash__ring--outer" />
              <span class="startup-splash__ring startup-splash__ring--inner" />
              <div class="startup-splash__nura">
                <Nura animated={true} size={140} label="Neuratal Code" />
              </div>
            </div>

            {/* Wordmark */}
            <div class="startup-splash__wordmark">
              <Wordmark outline fade={false} muted={false} class="mx-auto block text-v2-text-text-faint" />
            </div>

            {/* Loading row: animated progress only; no hard-coded copy, so the bundled splash respects every locale. */}
            <div class="startup-splash__loading" aria-hidden="true">
              <div class="startup-splash__loading-row">
                <span class="startup-splash__loading-dot" />
                <span class="startup-splash__loading-dot startup-splash__loading-dot--b" />
                <span class="startup-splash__loading-dot startup-splash__loading-dot--c" />
              </div>
              <div class="startup-splash__track" aria-hidden="true">
                <div class="startup-splash__bar" />
                <div class="startup-splash__bar startup-splash__bar--ghost" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div
        data-component="first-launch-splash"
        data-drawing={props.preview && !drawing.started ? "pending" : "running"}
        aria-hidden="true"
        class="h-dvh w-screen bg-v2-background-bg-base"
        style={{
          "padding-block-start": `calc(${titlebarHeight()} + ${props.platform.os === "windows" ? 1 : 8}px)`,
          "padding-block-end": "8px",
          "padding-inline": "32px",
        }}
        onAnimationEnd={(event) => {
          if (event.animationName === "first-launch-wordmark-draw") props.onDrawEnd()
        }}
      >
        <div class="relative size-full">
          <div class="absolute inset-x-0 top-[25.375%]">
            <div class="mx-auto w-full max-w-[720px]">
              <Wordmark
                outline
                fade={false}
                muted={false}
                class="mx-auto block h-auto w-4/5 text-v2-icon-icon-faint opacity-50"
              />
            </div>
          </div>
        </div>
      </div>
    </Show>
  )
}
