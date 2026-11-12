import { Show } from "solid-js"
import type { HomeSessionSearchController } from "./search"
import type { HomeSessionsController } from "./controller"
import { HomeSessionsRail } from "./rail"

export function HomeSessions(props: {
  sessions: HomeSessionsController
  search: HomeSessionSearchController
  onToggleSidebar?: () => void
}) {
  return (
    <Show when={props.sessions.session.server()}>
      {(server) => (
        <HomeSessionsRail
          sessions={props.sessions}
          search={props.search}
          server={server()}
          onToggleSidebar={props.onToggleSidebar}
        />
      )}
    </Show>
  )
}
