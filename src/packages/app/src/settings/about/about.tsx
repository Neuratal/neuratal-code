import { useDialog } from "@opencode/ui/context/dialog"
import { Nura } from "@opencode/ui/nura"
import { useLanguage } from "@/runtime/i18n/language"
import { usePlatform } from "@/runtime/platform/platform"
import { ExternalLink } from "@/runtime/platform/external-link"
import { showToast } from "@/shell/notifications/toast"
import { AnimatedWordmark } from "./animated-wordmark"

export function SettingsAbout(props: { active: boolean }) {
  const language = useLanguage()
  const platform = usePlatform()
  const dialog = useDialog()

  const showNotices = async () => {
    // The license texts load only when someone reads them.
    const loaded = await import("./notices/dialog").catch(() => undefined)

    if (!loaded) {
      showToast({ variant: "error", title: language.t("settings.about.notices.loadFailed") })

      return
    }

    void dialog.show(() => <loaded.default />)
  }

  return (
    <div class="settings-about">
      <div class="settings-about-intro">
        <div class="flex items-center gap-3.5 my-3 p-4 rounded-xl border border-[var(--nrtl-border,#1e1e20)] bg-[var(--nrtl-surface,#0b0b0c)]">
          <Nura size={44} />
          <div class="flex flex-col">
            <h3 class="text-base font-bold text-white leading-snug">Neuratal Code</h3>
            <span class="text-xs text-[var(--nrtl-primary,#7C5CFF)] font-semibold tracking-wide">
              {language.t("studio.tagline")}
            </span>
          </div>
        </div>
        <p>
          {language.t("settings.about.version", {
            version: platform.version ?? "2.2.1",
          })}
        </p>
        <p>{language.t("settings.about.license")}</p>
      </div>

      <AnimatedWordmark active={props.active} />

      <div class="settings-about-credits">
        <p>{language.t("settings.about.neural.description")}</p>
        <p>{language.t("settings.about.neural.thanks")}</p>
      </div>

      <p class="settings-about-faint">
        <ExternalLink href="https://neuratal.com">
          <bdi dir="ltr">{language.t("settings.about.website")}</bdi>
        </ExternalLink>
        <span aria-hidden="true"> · </span>
        <ExternalLink href="https://neuratal.com/feedback">
          <bdi dir="ltr">neuratal.com/feedback</bdi>
        </ExternalLink>
      </p>

      <p>{language.t("settings.about.neural.joke")}</p>

      <div class="settings-about-details">
        <p>
          <button type="button" class="settings-about-link" onClick={() => void showNotices()}>
            {language.t("settings.about.notices.title")}
          </button>
        </p>
      </div>

      <p>{language.t("settings.about.tagline")}</p>
      <div class="settings-about-copyright">
        <p>{language.t("settings.about.copyright")}</p>
      </div>
    </div>
  )
}
