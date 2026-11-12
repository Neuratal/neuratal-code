import { For, Show, createMemo, createSignal } from "solid-js"
import { Button } from "@opencode/ui/button"
import { Icon } from "@opencode/ui/icon"
import { Nura } from "@opencode/ui/nura"
import { displayName } from "@opencode/ui/project-avatar"
import type { HomeController } from "@/home/model"
import { HomeProjects } from "@/home/projects/region"
import type { HomeProjectsController } from "@/home/projects/controller"
import type { HomeScrollController } from "@/home/scroll"
import { HomeUtilityNav } from "@/home/projects/view"
import { useLanguage } from "@/runtime/i18n/language"
import { ServerConnection } from "@/runtime/server/registry"
import { useTabs } from "@/shell/tabs/tabs"
import { warmNewSessionRoute } from "@/shell/routes/warm"
import "./hero.css"

/**
 * The home "command deck": a single, calm surface that replaces the sidebar-plus-list layout with one
 * place to pick a workspace, start a flow, and jump back into recent work.
 */
export function HomeStudioHero(props: {
  home: HomeController
  projects: HomeProjectsController
  scroll: HomeScrollController
}) {
  const language = useLanguage()
  const tabs = useTabs()

  const connection = createMemo(() => props.home.server.focused())
  const project = createMemo(() => props.home.project.newSession())

  const projectName = createMemo(() => {
    const current = project()

    return current ? displayName(current) : undefined
  })

  const serverName = createMemo(() => {
    const current = connection()

    return current ? props.home.server.label(current) : undefined
  })

  const ready = createMemo(() => {
    const current = connection()

    return current ? props.home.server.health(current)?.healthy === true : false
  })

  const greeting = createMemo(() => {
    const hour = new Date().getHours()

    if (hour < 12) return language.t("studio.greeting.morning")

    if (hour < 18) return language.t("studio.greeting.day")

    return language.t("studio.greeting.evening")
  })

  const modes = () => [
    {
      id: "build",
      icon: "code-slash" as const,
      accent: "#7C5CFF",
      title: language.t("studio.mode.build.title"),
      description: language.t("studio.mode.build.desc"),
      prompt: language.t("studio.mode.build.prompt"),
    },
    {
      id: "plan",
      icon: "outline-brain" as const,
      accent: "#4F7CFF",
      title: language.t("studio.mode.plan.title"),
      description: language.t("studio.mode.plan.desc"),
      prompt: language.t("studio.mode.plan.prompt"),
    },
    {
      id: "review",
      icon: "shield" as const,
      accent: "#f5b841",
      title: language.t("studio.mode.review.title"),
      description: language.t("studio.mode.review.desc"),
      prompt: language.t("studio.mode.review.prompt"),
    },
    {
      id: "debug",
      icon: "flask" as const,
      accent: "#f87171",
      title: language.t("studio.mode.debug.title"),
      description: language.t("studio.mode.debug.desc"),
      prompt: language.t("studio.mode.debug.prompt"),
    },
    {
      id: "research",
      icon: "globe" as const,
      accent: "#a78bfa",
      title: language.t("studio.mode.research.title"),
      description: language.t("studio.mode.research.desc"),
      prompt: language.t("studio.mode.research.prompt"),
    },
  ]

  const [starting, setStarting] = createSignal(false)

  // Pointing at a start button begins the screen module download, so the
  // click itself only has to run the transition.
  const warm = () => void warmNewSessionRoute().catch(() => undefined)

  const startFlow = (prompt?: string) => {
    if (starting()) return
    const current = connection()
    const target = project()

    if (!current || !target) return
    warm()
    setStarting(true)
    void tabs
      .newDraft({ server: ServerConnection.key(current), directory: target.worktree }, prompt)
      .finally(() => setStarting(false))
  }

  return (
    <section class="nrtl-hero" aria-label={language.t("studio.hero.title")}>
      <div class="nrtl-hero-aurora" aria-hidden="true">
        <span class="nrtl-hero-blob nrtl-hero-blob-a" />
        <span class="nrtl-hero-blob nrtl-hero-blob-b" />
        <span class="nrtl-hero-blob nrtl-hero-blob-c" />
      </div>

      <header class="nrtl-hero-top">
        <div class="nrtl-hero-copy">
          <div class="nrtl-hero-eyebrow">
            <span class="nrtl-live-dot" data-ready={ready() || undefined} aria-hidden="true" />
            <span>{serverName() ?? language.t("common.loading")}</span>
            <span class="nrtl-hero-eyebrow-sep" aria-hidden="true" />
            <span>{ready() ? language.t("studio.hero.online") : language.t("studio.hero.offline")}</span>
          </div>
          <h1 class="nrtl-hero-title">
            <span class="nrtl-hero-greeting">{greeting()}</span>{" "}
            <span class="nrtl-hero-question">{language.t("studio.hero.title")}</span>
          </h1>
          <p class="nrtl-hero-subtitle">{language.t("studio.hero.subtitle")}</p>
        </div>
        <Nura size={44} class="nrtl-hero-nura" />
      </header>

      <div class="nrtl-hero-actions">
        <div class="nrtl-hero-workspace">
          <Show
            when={projectName()}
            fallback={
              <button
                type="button"
                class="nrtl-hero-workspace-add"
                onClick={() => {
                  const current = connection()

                  if (current) props.projects.project.choose(current)
                }}
                disabled={!connection()}
              >
                <Icon name="folder-add-left" size="small" />
                <span>{language.t("studio.hero.addProject")}</span>
              </button>
            }
          >
            <HomeProjects projects={props.projects} scroll={props.scroll} dropdown />
          </Show>
        </div>
        <Button
          variant="contrast"
          size="large"
          icon="plus"
          class="nrtl-hero-cta"
          onClick={() => startFlow()}
          onMouseEnter={warm}
          onFocus={warm}
          disabled={starting() || !connection() || !projectName()}
        >
          {language.t("studio.hero.newFlow")}
        </Button>
      </div>

      <div class="nrtl-modes-head">
        <span>{language.t("studio.hero.quickStart")}</span>
        <span class="nrtl-modes-rule" aria-hidden="true" />
      </div>

      <div class="nrtl-mode-grid">
        <For each={modes()}>
          {(mode) => (
            <button
              type="button"
              class="nrtl-mode-card"
              style={{ "--mode-accent": mode.accent }}
              onClick={() => startFlow(mode.prompt)}
              onMouseEnter={warm}
              onFocus={warm}
              disabled={starting() || !connection() || !projectName()}
            >
              <span class="nrtl-mode-icon">
                <Icon name={mode.icon} />
              </span>
              <span class="nrtl-mode-copy">
                <span class="nrtl-mode-title">{mode.title}</span>
                <span class="nrtl-mode-desc">{mode.description}</span>
              </span>
              <span class="nrtl-mode-arrow" aria-hidden="true">
                <Icon name="arrow-up" size="small" />
              </span>
            </button>
          )}
        </For>
      </div>

      <footer class="nrtl-hero-foot">
        <HomeUtilityNav
          class="nrtl-hero-utility"
          onOpenSettings={props.projects.utility.settings}
          onOpenHelp={props.projects.utility.help}
          language={language}
        />
      </footer>
    </section>
  )
}
