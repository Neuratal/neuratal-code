import { Wordmark } from "@opencode/ui/wordmark"

export function AnimatedWordmark(_props: { active: boolean }) {
  return (
    <div class="settings-about-wordmark flex justify-center py-4" aria-hidden="true">
      <Wordmark class="w-64 h-auto" />
    </div>
  )
}
