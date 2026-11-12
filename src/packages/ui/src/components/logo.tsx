import { createUniqueId, type ComponentProps } from "solid-js"

/**
 * Neuratal monogram: an N cut out of the Aurora gradient tile. Nura (the mascot)
 * lives in its own component so it can animate without forcing SVG work.
 */
export const Mark = (props: { class?: string }) => {
  const gradient = createUniqueId()

  return (
    <svg
      data-component="logo-mark"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradient} x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#7C5CFF" />
          <stop offset="55%" stop-color="#5B3FD9" />
          <stop offset="100%" stop-color="#22D3EE" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradient})`} />
      <path
        d="M9 23V9h3.4l7.2 10.3V9H23v14h-3.4L12.4 12.7V23H9Z"
        fill="#05060A"
      />
    </svg>
  )
}

export const Splash = (props: Pick<ComponentProps<"svg">, "ref" | "class">) => {
  const gradient = createUniqueId()
  const glow = createUniqueId()

  return (
    <svg
      ref={props.ref}
      data-component="logo-splash"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradient} x1="6" y1="6" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#7C5CFF" />
          <stop offset="55%" stop-color="#5B3FD9" />
          <stop offset="100%" stop-color="#22D3EE" />
        </linearGradient>
        <filter id={glow} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#7C5CFF" flood-opacity="0.45" />
        </filter>
      </defs>
      <rect width="96" height="96" rx="26" fill={`url(#${gradient})`} filter={`url(#${glow})`} />
      <path
        d="M27 69V27h10.2l21.6 30.9V27H69v42H58.8L37.2 38.1V69H27Z"
        fill="#05060A"
      />
    </svg>
  )
}

export const Logo = (props: { class?: string }) => {
  return (
    <div
      classList={{
        "flex items-center gap-2.5 select-none": true,
        [props.class ?? ""]: !!props.class,
      }}
    >
      <Mark class="w-6 h-6 shrink-0" />
      <div class="flex flex-col leading-none">
        <span class="text-[14px] font-bold tracking-tight text-v2-text-text-primary">Neuratal</span>
        <span class="text-[10px] font-semibold tracking-wider text-[var(--nrtl-primary,#7C5CFF)] uppercase">Code</span>
      </div>
    </div>
  )
}
