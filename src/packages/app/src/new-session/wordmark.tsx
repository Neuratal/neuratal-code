import { onMount } from "solid-js"
import { Nura } from "@opencode/ui/nura"
import { Wordmark } from "@opencode/ui/wordmark"
import { useLanguage } from "@/runtime/i18n/language"
import "./wordmark.css"

export type LodgerBall = {
  radius: () => number
  at: () => { x: number; y: number }
  place: (
    x: number,
    y: number,
    pose: { look: number; lookAngle: number; stretch: number; angle: number; squint: number; curl: number },
  ) => void
  blink: () => void
  done: () => void
}

/**
 * Neuratal Code hero header for the New Session screen: the animated Nura emblem
 * above the Neuratal wordmark.
 */
export function NewSessionWordmark(props: {
  ref: (element: HTMLDivElement) => void
  pins?: boolean
  sound?: () => boolean
  onOpen?: () => void
  onClose?: () => void
  onFlat?: () => void
  onPlay?: (ball: LodgerBall) => void
}) {
  const language = useLanguage()
  let box!: HTMLDivElement

  onMount(() => {
    if (box) {
      props.ref(box)
    }
  })

  return (
    <div
      data-component="new-session-wordmark"
      class="mx-auto w-full max-w-[760px] select-none pointer-events-auto transition-all duration-300"
    >
      <div
        ref={(el) => {
          box = el
          props.ref(el)
        }}
        data-slot="wordmark-box"
        class="relative mx-auto flex flex-col items-center justify-center pt-2 pb-5 text-center"
      >
        {/* Neuratal Aurora ambient backlight. The gradient reaches transparent at its own
            edge, so the light fades out instead of stopping at a visible rectangle. */}
        <div
          class="absolute left-1/2 top-1/2 h-[260px] w-[min(720px,94vw)] -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10"
          style={{
            background:
              "radial-gradient(ellipse 50% 50% at 50% 46%, rgba(124, 92, 255, 0.20) 0%, rgba(124, 92, 255, 0.10) 34%, rgba(34, 211, 238, 0.05) 58%, transparent 100%)"
          }}
        />

        {/* Brand identity: animated Nura emblem + wordmark */}
        <div class="flex flex-col items-center gap-3">
          <Nura size={84} class="transition-transform duration-300 hover:scale-105" />

          {/* Title Wordmark — the CODE badge hangs off the side so the lockup itself stays centered. */}
          <h1 class="relative flex items-end mt-1">
            <Wordmark shine class="w-[220px] sm:w-[300px]" />
            <span class="absolute left-full bottom-1.5 ml-2 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] rounded-md bg-[rgba(124,92,255,0.10)] text-[#9d8cff] border border-[#7C5CFF]/35">
              CODE
            </span>
          </h1>

          {/* Tagline */}
          <div class="flex items-center gap-2 text-xs sm:text-[13px] font-medium text-[#7C5CFF] tracking-wide">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7C5CFF] opacity-75" />
              <span class="relative inline-flex rounded-full h-2 w-2 bg-[#7C5CFF] shadow-[0_0_8px_#7C5CFF]" />
            </span>
            <span>{language.t("studio.tagline")}</span>
          </div>
        </div>

        {/* Feature badges with Aurora accents */}
        <div class="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px]">
          <div class="px-3 py-1 rounded-full bg-[#0B0B0C]/90 border border-[#7C5CFF]/30 text-[#7C5CFF] font-semibold flex items-center gap-1.5 shadow-[0_0_10px_rgba(124, 92, 255,0.12)]">
            <span>✦</span>
            <span>{language.t("studio.badge.akisame")}</span>
          </div>
          <div class="px-3 py-1 rounded-full bg-[#0B0B0C]/90 border border-[#1E1E20] text-[#E4E4E7] font-medium flex items-center gap-1.5 hover:border-[#7C5CFF]/40 transition-colors">
            <span class="text-[#22D3EE]">✦</span>
            <span>{language.t("studio.badge.autonomous")}</span>
          </div>
          <div class="px-3 py-1 rounded-full bg-[#0B0B0C]/90 border border-[#1E1E20] text-[#E4E4E7] font-medium flex items-center gap-1.5 hover:border-[#7C5CFF]/40 transition-colors">
            <span class="text-[#7C5CFF]">✦</span>
            <span>{language.t("studio.badge.oled")}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
