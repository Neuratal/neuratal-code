import { Show } from "solid-js"
import type { ComponentProps } from "solid-js"
import wordmarkImage from "../../assets/brand/neuratal-wordmark.png"
import "./wordmark.css"

/**
 * Neuratal wordmark — the approved brand lockup with Nura sitting inside the
 * second "A". It renders as an image so the serif letterforms, aurora gradient
 * and glow stay identical to the artwork at every size. `fade`, `muted` and
 * `outline` stay accepted for compatibility; `shine` adds the one-time aurora
 * sweep used on the New Session hero.
 */
export function Wordmark(
  props: Pick<ComponentProps<"div">, "class"> & {
    fade?: boolean
    muted?: boolean
    outline?: boolean
    shine?: boolean
  },
) {
  return (
    <div
      data-component="neuratal-wordmark"
      classList={{
        "select-none": true,
        [props.class ?? ""]: !!props.class,
      }}
    >
      <span data-slot="wordmark-frame">
        <img data-slot="wordmark-image" src={wordmarkImage} alt="Neuratal" draggable={false} />
        <Show when={props.shine}>
          <img data-slot="wordmark-shine" src={wordmarkImage} alt="" aria-hidden="true" draggable={false} />
        </Show>
      </span>
    </div>
  )
}
