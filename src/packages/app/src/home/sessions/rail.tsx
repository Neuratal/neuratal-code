import { Key } from "@solid-primitives/keyed"
import { createMemo, For, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { Icon } from "@opencode/ui/icon"
import { IconButton } from "@opencode/ui/icon-button"
import { Loader } from "@opencode/ui/loader"
import { Nura } from "@opencode/ui/nura"
import { useLanguage } from "@/runtime/i18n/language"
import { getRelativeTime } from "@/shell/time"
import type { ServerConnection } from "@/runtime/server/registry"
import { homeSessionSearchKey, type HomeSessionRecord, type HomeSessionsController } from "./controller"
import type { HomeSessionSearchController } from "./search"
import { HomeSessionRow, HomeSessionsEmpty, type HomeSessionRowUI } from "./view"
import "./rail.css"

const HOME_SESSION_SEARCH_RESULTS_ID = "home-session-rail-results"

/**
 * Codex-style recent chats rail: every conversation, most recently messaged first,
 * grouped by day and always beside the deck.
 */
export function HomeSessionsRail(props: {
  sessions: HomeSessionsController
  search: HomeSessionSearchController
  server: ServerConnection.Key
  onToggleSidebar?: () => void
}) {
  const language = useLanguage()
  const [rowUI, setRowUI] = createStore<HomeSessionRowUI>({ menu: undefined, editor: undefined })

  const filtering = createMemo(() => props.search.query.value().trim().length > 0)
  const rows = createMemo(() => (filtering() ? props.search.result.list() : props.sessions.data.records()))

  const time = (updated: number | undefined, created: number) =>
    getRelativeTime(new Date(updated ?? created).toISOString(), language.t)

  const row = (record: HomeSessionRecord) => {
    const key = homeSessionSearchKey(record)

    return (
      <div
        class="nrtl-rail-row"
        data-key={key}
        id={`home-session-rail-option-${key}`}
        data-active={(filtering() && props.search.result.active() === key) || undefined}
        data-selected={props.sessions.tab.isOpen(record) || undefined}
        role={filtering() ? "option" : undefined}
        aria-selected={filtering() ? props.search.result.active() === key : undefined}
        onMouseEnter={() => {
          if (filtering()) props.search.result.highlight(record)
        }}
      >
        <HomeSessionRow
          language={language}
          desktop={props.sessions.platform.desktop}
          showProjectName={props.sessions.session.showProjectName()}
          server={props.server}
          record={record}
          rowUI={rowUI}
          setRowUI={setRowUI}
          showLocations={false}
          hoveredSession={undefined}
          onHoverSession={() => {}}
          location={props.sessions.location.value}
          onRevealLocations={props.sessions.location.sync}
          isOpenTab={props.sessions.tab.isOpen}
          onOpenSession={props.sessions.session.open}
          onArchiveSession={props.sessions.session.archive}
          onRenameSession={props.sessions.session.rename}
          onExportSession={props.sessions.session.export}
          onDeleteSession={props.sessions.session.showDelete}
          trailing={time(record.session.time.updated, record.session.time.created)}
        />
      </div>
    )
  }

  return (
    <aside
      data-slot="home-rail"
      class="nrtl-rail"
      aria-label={language.t("studio.recentChats.title")}
      onWheel={(event) => event.stopPropagation()}
    >
      <div class="nrtl-rail-head">
        <span class="nrtl-rail-title">{language.t("studio.recentChats.title")}</span>
        <div class="flex items-center gap-0.5">
          <IconButton
            type="button"
            variant="ghost-muted"
            size="small"
            icon={<Icon name="plus" />}
            aria-label={language.t("studio.recentChats.new")}
            title={language.t("studio.recentChats.new")}
            disabled={!props.sessions.session.canCreate()}
            onClick={props.sessions.session.create}
          />
          <Show when={props.onToggleSidebar}>
            {(toggle) => (
              <IconButton
                type="button"
                variant="ghost-muted"
                size="small"
                icon={<Icon name="layout-left" />}
                aria-label={language.t("command.sidebar.toggle")}
                title={language.t("command.sidebar.toggle")}
                onClick={toggle()}
              />
            )}
          </Show>
        </div>
      </div>

      <div ref={props.search.element.setRoot} class="nrtl-rail-body">
        <div data-component="home-session-search" class="nrtl-rail-search">
          <Icon name="magnifying-glass" size="small" class="shrink-0" />
          <input
            ref={props.search.element.setInput}
            class="nrtl-rail-search-input"
            value={props.search.query.value()}
            placeholder={props.search.query.placeholder()}
            aria-label={props.search.query.placeholder()}
            aria-controls={HOME_SESSION_SEARCH_RESULTS_ID}
            aria-expanded={filtering()}
            aria-autocomplete="list"
            aria-activedescendant={
              filtering() && props.search.result.active()
                ? `home-session-rail-option-${props.search.result.active()}`
                : undefined
            }
            onFocus={props.search.query.focus}
            onInput={(event) => props.search.query.input(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault()
                props.search.query.close()
                event.currentTarget.blur()

                return
              }

              if (!filtering() || props.search.result.list().length === 0) return

              if (event.altKey || event.metaKey) return

              if (event.key === "ArrowDown") {
                event.preventDefault()
                props.search.result.move(1)

                return
              }

              if (event.key === "ArrowUp") {
                event.preventDefault()
                props.search.result.move(-1)

                return
              }

              if (event.key === "Enter" && !event.isComposing) {
                event.preventDefault()
                props.search.result.selectActive()
              }
            }}
          />
          <Show when={props.search.query.value()}>
            <IconButton
              type="button"
              variant="ghost-muted"
              size="small"
              class="shrink-0"
              icon={<Icon name="close" size="large" class="text-v2-icon-icon-muted" />}
              aria-label={language.t("common.close")}
              onClick={() => {
                props.search.query.close()
                props.search.query.focus()
              }}
            />
          </Show>
        </div>

        <div
          id={HOME_SESSION_SEARCH_RESULTS_ID}
          role={filtering() ? "listbox" : undefined}
          ref={props.search.element.setList}
          class="nrtl-rail-list"
          data-scrollable
        >
          <Show when={!props.sessions.data.loading() && rows().length === 0}>
            <Show
              when={filtering()}
              fallback={
                <HomeSessionsEmpty language={language} scopeName={props.sessions.session.scopeName()} />
              }
            >
              <div class="nrtl-rail-no-results">
                <Nura size={26} />
                <p class="nrtl-rail-empty-text">{props.search.result.noResultsLabel()}</p>
              </div>
            </Show>
          </Show>

          <Show when={props.search.result.loading()}>
            <div class="nrtl-rail-loader">
              <Loader class="size-4" />
            </div>
          </Show>

          <Show when={!props.search.result.loading() || rows().length > 0}>
            <Show
              when={filtering()}
              fallback={
                <For each={props.sessions.data.groups()}>
                  {(group) => (
                    <section class="nrtl-rail-group">
                      <div class="nrtl-rail-group-title">{group.title}</div>
                      <Key each={group.sessions} by={(record) => record.session.id}>
                        {(record) => row(record())}
                      </Key>
                    </section>
                  )}
                </For>
              }
            >
              <Key each={props.search.result.list()} by={(record) => record.session.id}>
                {(record) => row(record())}
              </Key>
            </Show>
          </Show>
        </div>
      </div>
    </aside>
  )
}
