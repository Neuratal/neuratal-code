import { Show } from "solid-js"
import nuraAvatar from "../assets/brand/nura-avatar.png"
import "./nura.css"

/**
 * Nura, the Neuratal Code mascot.
 *
 * Renders the circular emblem with a slow float, an aurora glow and an occasional
 * blink. Pass `animated={false}` for a still frame; reduced-motion preferences are
 * honoured in CSS. Nura is decorative by default — give `label` when the avatar is
 * the only content that identifies the assistant.
 */
export function Nura(props: {
  class?: string
  size?: number | string
  animated?: boolean
  label?: string
}) {
  const size = () => (typeof props.size === "number" ? `${props.size}px` : (props.size ?? "32px"))

  return (
    <span
      data-component="nura"
      data-animated={props.animated === false ? "false" : "true"}
      role={props.label ? "img" : undefined}
      aria-label={props.label}
      aria-hidden={props.label ? undefined : "true"}
      classList={{ [props.class ?? ""]: !!props.class }}
      style={{ "--nura-size": size() }}
    >
      <img data-slot="nura-face" src={nuraAvatar} alt="" draggable={false} />
      <Show when={props.animated !== false}>
        <span data-slot="nura-lid" data-side="left" />
        <span data-slot="nura-lid" data-side="right" />
      </Show>
    </span>
  )
}
