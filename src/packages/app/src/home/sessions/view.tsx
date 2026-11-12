import type { SessionInfo } from "@opencode/client/promise"
import { createMemo, onCleanup, Show } from "solid-js"
import { warmSessionRoute } from "@/shell/routes/warm"
import type { SetStoreFunction } from "solid-js/store"
import { InlineInput } from "@opencode/ui/inline-input"
import { Icon } from "@opencode/ui/icon"
import { IconButton } from "@opencode/ui/icon-button"
import { Nura } from "@opencode/ui/nura"
import { Menu } from "@opencode/ui/menu"
import { Tooltip } from "@opencode/ui/tooltip"
import { useLanguage } from "@/runtime/i18n/language"
import { ServerConnection } from "@/runtime/server/registry"
import { SessionTabAvatarView } from "@/shell/layout/session-tab-avatar"
import { sessionLabel } from "@/session/title"
import { shouldOpenSessionInBackground } from "./open"
import "./view.css"
import { HomeSessionStatusController, type HomeSessionRecord, type OpenSessionOptions } from "./controller"

const SHOW_HOME_SESSION_ARCHIVE = false

const HOME_SESSION_LONG_PRESS_MS = 500

// Middle-click or Cmd+click on macOS (Ctrl+click elsewhere) opens a session
// tab in the background without navigating, matching browser conventions.
function isBackgroundOpen(event: MouseEvent) {
  return shouldOpenSessionInBackground({
    button: event.button,
    mac: typeof navigator === "object" && /(Mac|iPod|iPhone|iPad)/.test(navigator.platform),
    meta: event.metaKey,
    ctrl: event.ctrlKey,
    shift: event.shiftKey,
    alt: event.altKey,
  })
}

// Session store updates recreate row components, so row-local state would
// close an open context menu or drop an in-progress rename. Keep both keyed
// by session ID at the view root, like the projects list does.
export type HomeSessionRowUI = {
  menu: { id: string; x: number; y: number } | undefined
  editor: { id: string; draft: string; renaming: boolean } | undefined
}

export type HomeSessionRowProps = {
  language: ReturnType<typeof useLanguage>
  desktop: boolean
  showProjectName: boolean
  server: ServerConnection.Key
  location: (record: HomeSessionRecord) => { worktree: string; branch: string | undefined }
  onRevealLocations: (record?: HomeSessionRecord) => void
  isOpenTab: (record: HomeSessionRecord) => boolean
  onOpenSession: (session: SessionInfo, options?: OpenSessionOptions) => void
  onArchiveSession: (session: SessionInfo) => Promise<void>
  onRenameSession: (server: ServerConnection.Key, session: SessionInfo, title: string) => Promise<boolean>
  onExportSession: (server: ServerConnection.Key, session: SessionInfo) => Promise<void>
  onDeleteSession: (server: ServerConnection.Key, session: SessionInfo) => void
  record: HomeSessionRecord
  rowUI: HomeSessionRowUI
  setRowUI: SetStoreFunction<HomeSessionRowUI>
  showLocations: boolean
  hoveredSession: string | undefined
  onHoverSession: (sessionID: string | undefined) => void
  /** Short label rendered at the row's trailing edge, such as a relative time. */
  trailing?: string
}

function HomeSessionLeadingController(props: {
  server: ServerConnection.Key
  isOpenTab: (record: HomeSessionRecord) => boolean
  record: HomeSessionRecord
}) {
  return (
    <HomeSessionStatusController
      server={props.server}
      record={props.record}
      isOpenTab={props.isOpenTab}
      render={(state) => (
        <HomeSessionLeading
          record={props.record}
          open={state.open()}
          unread={state.unread()}
          loading={state.loading()}
        />
      )}
    />
  )
}

function HomeSessionLeading(props: { record: HomeSessionRecord; open: boolean; unread: boolean; loading: boolean }) {
  return (
    <div class="relative shrink-0">
      <Show when={props.open}>
        <span
          aria-hidden="true"
          class={`
            pointer-events-none absolute top-1/2 h-3 w-0.5 -translate-y-1/2
            rounded-[2px] bg-[#7C5CFF]
          `}
          style={{ right: "calc(100% + 4px)" }}
        />
      </Show>
      <SessionTabAvatarView
        project={props.record.project}
        directory={props.record.session.location.directory}
        unread={props.unread}
        loading={props.loading}
      />
    </div>
  )
}

export function HomeSessionRow(props: HomeSessionRowProps) {
  const title = createMemo(() => sessionLabel(props.record.session))
  const location = createMemo(() => props.location(props.record))
  const showProjectName = () => props.showProjectName && props.record.projectName
  const sessionID = () => props.record.session.id
  const menu = () => (props.rowUI.menu?.id === sessionID() ? props.rowUI.menu : undefined)
  const editor = () => (props.rowUI.editor?.id === sessionID() ? props.rowUI.editor : undefined)
  let longPressTimer: ReturnType<typeof setTimeout> | undefined
  let longPressStart: { x: number; y: number } | undefined
  let suppressClick = false
  let menuInteractedOutside = false

  // Focus targets are looked up by session ID: session store updates recreate
  // row components, so instance refs can point at detached nodes by the time
  // deferred focus runs.
  const rowSelector = () => `[data-component="home-session-row-container"][data-session-id="${sessionID()}"]`

  const rowButton = () =>
    document.querySelector<HTMLButtonElement>(`${rowSelector()} [data-component="home-session-row"]`)

  const renameInput = () =>
    document.querySelector<HTMLInputElement>(`${rowSelector()} [data-component="home-session-rename"]`)

  const clearLongPress = () => {
    if (longPressTimer !== undefined) clearTimeout(longPressTimer)
    longPressTimer = undefined
    longPressStart = undefined
  }

  onCleanup(clearLongPress)

  const openMenu = (element: HTMLElement, clientX: number, clientY: number) => {
    const bounds = element.getBoundingClientRect()
    props.setRowUI("menu", { id: sessionID(), x: clientX - bounds.left, y: clientY - bounds.top })
  }

  const openEditor = () => {
    props.setRowUI("editor", { id: sessionID(), draft: title(), renaming: false })
    requestAnimationFrame(() => {
      const input = renameInput()
      input?.focus()
      input?.select()
    })
  }

  const closeEditor = () => {
    if (editor()?.renaming) return
    props.setRowUI("editor", (value) => (value?.id === sessionID() ? undefined : value))
  }

  const saveEditor = async () => {
    const current = editor()

    if (!current || current.renaming) return
    props.setRowUI("editor", { ...current, renaming: true })
    const saved = await props.onRenameSession(props.server, props.record.session, current.draft)
    // Disabling the input during the request drops focus to the body; restore
    // it unless the user focused another control while the rename was pending.
    const restore = document.activeElement === document.body || document.activeElement === renameInput()
    props.setRowUI("editor", (value) => {
      if (value?.id !== sessionID()) return value

      return saved ? undefined : { ...value, renaming: false }
    })

    if (!restore) return
    requestAnimationFrame(() => {
      if (saved) {
        rowButton()?.focus()

        return
      }

      renameInput()?.focus()
    })
  }

  return (
    <div
      data-component="home-session-row-container"
      data-project-name={!!showProjectName()}
      data-session-id={props.record.session.id}
      class="group/session relative flex h-10 min-w-0 items-center rounded-[6px] outline-none focus:outline-none focus-visible:outline-none"
      onContextMenu={(event) => {
        // While renaming, keep the native menu so paste and spelling work.
        if (editor()) return
        event.preventDefault()
        openMenu(event.currentTarget, event.clientX, event.clientY)
      }}
    >
      <Show
        when={!editor()}
        fallback={
          <div
            data-slot="home-session-editor"
            class="flex h-10 min-w-0 w-full flex-1 items-center py-3 ps-1.5 pe-3 md:ps-3"
            classList={{ "gap-1.5": props.desktop, "gap-2": !props.desktop, "md:pe-10": SHOW_HOME_SESSION_ARCHIVE }}
          >
            <HomeSessionLeadingController server={props.server} isOpenTab={props.isOpenTab} record={props.record} />
            <div data-slot="home-session-labels" class="contents">
              <InlineInput
                data-component="home-session-rename"
                aria-label={props.language.t("common.rename")}
                dir="auto"
                value={editor()?.draft ?? ""}
                disabled={editor()?.renaming ?? false}
                class={`
                block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-v2-text-text-base
                [font-weight:530] field-sizing-content outline-none focus:outline-none focus-visible:outline-none
                 ${showProjectName() ? "max-w-[min(70%,480px)] flex-[0_1_auto]" : "flex-[1_1_auto]"}
              `}
                style={{ "--inline-input-shadow": "none", "text-align": "start" }}
                onInput={(event) => {
                  const draft = event.currentTarget.value
                  props.setRowUI("editor", (value) => (value?.id === sessionID() ? { ...value, draft } : value))
                }}
                onKeyDown={(event) => {
                  event.stopPropagation()

                  // Enter and Escape during IME composition commit or cancel
                  // the composition, not the rename. Safari can report the
                  // composition-confirming keydown with isComposing false but
                  // keyCode 229.
                  if (event.isComposing || event.keyCode === 229) return

                  if (event.key === "Enter") {
                    event.preventDefault()
                    void saveEditor()

                    return
                  }

                  if (event.key !== "Escape") return
                  event.preventDefault()
                  closeEditor()
                  requestAnimationFrame(() => rowButton()?.focus())
                }}
                onBlur={closeEditor}
              />
              <Show when={showProjectName()}>
                <HomeSessionProjectName name={props.record.projectName} />
              </Show>
            </div>
          </div>
        }
      >
        <button
          type="button"
          data-component="home-session-row"
          aria-haspopup="menu"
          aria-expanded={!!menu()}
          class={`
            flex h-10 min-w-0 w-full flex-1 shrink-0 cursor-default items-center rounded-[6px] border-0
            bg-transparent py-3 ps-1.5 pe-3 md:ps-3 text-start text-v2-text-text-muted [font-weight:530]
            transition-[background-color,color,box-shadow] duration-[120ms] ease-in-out
            hover:bg-v2-overlay-simple-overlay-hover focus-visible:bg-v2-overlay-simple-overlay-hover focus-visible:outline-none
          `}
          classList={{ "gap-1.5": props.desktop, "gap-2": !props.desktop, "md:pe-10": SHOW_HOME_SESSION_ARCHIVE }}
          onMouseDown={(event) => {
            if (event.button === 1) event.preventDefault()
          }}
          onMouseEnter={() => {
            props.onHoverSession(props.record.session.id)
            props.onRevealLocations(props.record)
            void warmSessionRoute().catch(() => undefined)
          }}
          onMouseLeave={() => props.onHoverSession(undefined)}
          onPointerDown={(event) => {
            suppressClick = false

            if (event.pointerType !== "touch") return
            clearLongPress()
            const element = event.currentTarget
            const x = event.clientX
            const y = event.clientY
            longPressStart = { x, y }
            longPressTimer = setTimeout(() => {
              suppressClick = true
              clearLongPress()
              openMenu(element, x, y)
            }, HOME_SESSION_LONG_PRESS_MS)
          }}
          onPointerMove={(event) => {
            if (!longPressStart) return

            if (Math.abs(event.clientX - longPressStart.x) <= 8 && Math.abs(event.clientY - longPressStart.y) <= 8)
              return
            clearLongPress()
          }}
          onPointerUp={clearLongPress}
          onPointerCancel={() => {
            clearLongPress()
            suppressClick = false
          }}
          onKeyDown={(event) => {
            if (event.key !== "ContextMenu" && (event.key !== "F10" || !event.shiftKey)) return
            event.preventDefault()
            const bounds = event.currentTarget.getBoundingClientRect()
            openMenu(event.currentTarget, bounds.left + 12, bounds.bottom)
          }}
          onClick={(event) => {
            // The flag stays set until the long-press compatibility click
            // arrives, however delayed; keyboard activation (detail 0) is
            // never that click and passes through.
            if (suppressClick) {
              suppressClick = false

              if (event.detail !== 0) {
                event.preventDefault()

                return
              }
            }

            props.onOpenSession(props.record.session, { background: isBackgroundOpen(event) })
          }}
          onAuxClick={(event) => {
            if (!isBackgroundOpen(event)) return
            event.preventDefault()
            props.onOpenSession(props.record.session, { background: true })
          }}
        >
          <HomeSessionLeadingController server={props.server} isOpenTab={props.isOpenTab} record={props.record} />
          <div
            data-slot="home-session-labels"
            class="min-w-0 flex-1 items-center gap-1.5"
            classList={{ flex: props.desktop, contents: !props.desktop }}
          >
            <HomeSessionTitle title={title()} showProjectName={!!showProjectName()} />
            <Show when={showProjectName()}>
              <HomeSessionProjectName name={props.record.projectName} trailing={props.desktop} />
            </Show>
            <HomeSessionLocation
              location={location()}
              show={props.showLocations || props.hoveredSession === props.record.session.id}
              instantHide={
                !props.showLocations &&
                props.hoveredSession !== undefined &&
                props.hoveredSession !== props.record.session.id
              }
              desktop={props.desktop}
            />
          </div>
          <Show when={props.trailing}>
            {(trailing) => (
              <span class="shrink-0 ps-2 text-[11px] leading-4 text-v2-text-text-faint [font-weight:440]">
                {trailing()}
              </span>
            )}
          </Show>
        </button>
      </Show>
      <Menu
        modal={false}
        placement="bottom-start"
        gutter={2}
        open={!!menu()}
        onOpenChange={(open) => {
          if (open) return
          props.setRowUI("menu", (value) => (value?.id === sessionID() ? undefined : value))
        }}
      >
        <Menu.Trigger
          as="span"
          aria-hidden="true"
          tabIndex={-1}
          class="pointer-events-none absolute size-px"
          style={{ left: `${menu()?.x ?? 0}px`, top: `${menu()?.y ?? 0}px` }}
        />
        <Menu.Portal>
          <Menu.Content
            onInteractOutside={() => {
              menuInteractedOutside = true
            }}
            onCloseAutoFocus={(event) => {
              // The trigger is an invisible positioning span, so Kobalte's
              // default close focus restore has no useful target. Skip the
              // row focus when the rename editor owns focus or the user
              // dismissed the menu by interacting elsewhere.
              event.preventDefault()
              const outside = menuInteractedOutside
              menuInteractedOutside = false

              if (outside || editor()) return
              requestAnimationFrame(() => rowButton()?.focus())
            }}
          >
            <Menu.Item onSelect={openEditor}>{props.language.t("common.rename")}</Menu.Item>
            <Menu.Item onSelect={() => void props.onExportSession(props.server, props.record.session)}>
              {props.language.t("common.export")}…
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item onSelect={() => props.onDeleteSession(props.server, props.record.session)}>
              {props.language.t("common.delete")}…
            </Menu.Item>
          </Menu.Content>
        </Menu.Portal>
      </Menu>
      <Show when={SHOW_HOME_SESSION_ARCHIVE}>
        <div
          class={`
            hover-reveal absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1
            group-hover/session:opacity-100 focus-within:opacity-100
          `}
        >
          <Tooltip class="flex shrink-0 items-center" placement="bottom" value={props.language.t("common.archive")}>
            <IconButton
              data-action="home-session-archive"
              variant="ghost-muted"
              size="large"
              icon={<Icon name="archive" />}
              aria-label={props.language.t("common.archive")}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                void props.onArchiveSession(props.record.session)
              }}
            />
          </Tooltip>
        </div>
      </Show>
    </div>
  )
}

function HomeSessionTitle(props: { title: string; showProjectName: boolean; search?: boolean }) {
  return (
    <span
      data-component="home-session-title"
      dir="auto"
      class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-v2-text-text-base [font-weight:530]"
      classList={{
        "text-[13px] leading-4 tracking-[-0.04px]": !!props.search,
        "max-w-[min(70%,480px)] flex-[0_1_auto]": props.showProjectName,
        "flex-[1_1_auto]": !props.showProjectName,
      }}
    >
      {props.title}
    </span>
  )
}

function HomeSessionLocation(props: {
  location: { worktree: string; branch: string | undefined }
  show: boolean
  instantHide: boolean
  desktop: boolean
}) {
  if (!props.desktop) return null

  return (
    <span
      dir="ltr"
      aria-hidden={!props.show || undefined}
      class="flex min-w-0 shrink-0 items-center gap-1.5 overflow-hidden whitespace-nowrap ease-out motion-reduce:transition-none"
      classList={{
        "-ms-1.5 max-w-0 opacity-0": !props.show,
        "max-w-[60%] opacity-100": props.show,
        "transition-[max-width,opacity] duration-[120ms]": !props.instantHide,
        "transition-none": props.instantHide,
      }}
    >
      <Icon name="outline-worktree" class="shrink-0 text-v2-icon-icon-muted" />
      <span class="min-w-0 overflow-hidden text-ellipsis [font-weight:440]">{props.location.worktree}</span>
      <Show when={props.location.branch}>
        {(branch) => (
          <>
            <Icon name="branch" class="shrink-0 text-v2-icon-icon-muted" />
            <span class="min-w-0 overflow-hidden text-ellipsis [font-weight:440]">{branch()}</span>
          </>
        )}
      </Show>
    </span>
  )
}

function HomeSessionProjectName(props: { name: string; search?: boolean; trailing?: boolean }) {
  return (
    <span
      data-component="home-session-project-name"
      dir="auto"
      class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-v2-text-text-muted [font-weight:440]"
      classList={{
        "flex-[0_1_auto]": !!props.trailing,
        "flex-[1_1_auto]": !props.trailing,
        "text-[13px] leading-4 tracking-[-0.04px]": !!props.search,
      }}
    >
      {props.name}
    </span>
  )
}

export function HomeSessionsEmpty(props: {
  language: ReturnType<typeof useLanguage>
  scopeName: string | undefined
}) {
  return (
    <div class="nrtl-empty">
      <Nura size={40} />
      <div class="nrtl-empty-copy">
        <h2>
          {props.scopeName
            ? props.language.t("studio.sessions.empty.scoped", { scope: props.scopeName })
            : props.language.t("studio.sessions.empty.title")}
        </h2>
        <p>{props.language.t("studio.sessions.empty.body")}</p>
      </div>
    </div>
  )
}
