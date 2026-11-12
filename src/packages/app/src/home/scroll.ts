export function createHomeScrollController() {
  let viewport: HTMLDivElement | undefined

  // Keep wheel gestures inside a project menu from scrolling the deck until the
  // innermost scrollable element has nothing left to move.
  function containWheel(event: WheelEvent) {
    if (!viewport) return

    if (event.defaultPrevented || event.ctrlKey || !event.deltaY) return

    if (!(event.target instanceof Element)) return
    const scrollable = event.target.closest<HTMLElement>("[data-scrollable]")

    if (
      scrollable !== viewport &&
      scrollable &&
      (event.deltaY < 0
        ? scrollable.scrollTop > 0
        : scrollable.scrollTop < scrollable.scrollHeight - scrollable.clientHeight)
    )
      return
    event.preventDefault()
  }

  return {
    viewport: {
      setViewport: (element: HTMLDivElement) => {
        viewport = element
      },
      containWheel,
    },
  }
}

export type HomeScrollController = ReturnType<typeof createHomeScrollController>
