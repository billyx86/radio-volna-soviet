/** Keyboard navigation for the station list (roving tabindex, radio-dial
 *  style: moving selection retunes to the channel). Kept pure so the
 *  wrap/edge logic is unit-testable without a DOM. */

export type ChannelNavKey = "ArrowDown" | "ArrowUp" | "Home" | "End";

export function isChannelNavKey(key: string): key is ChannelNavKey {
  return key === "ArrowDown" || key === "ArrowUp" || key === "Home" || key === "End";
}

/**
 * Index of the channel button to focus/select after a navigation key.
 *
 * @param key       which navigation key was pressed
 * @param activeIdx currently-focused button index, or -1 if focus is
 *                  outside the list (e.g. the list just received focus)
 * @param count     number of enabled channel buttons
 * @returns the next index, or -1 when the list is empty
 */
export function nextChannelIndex(
  key: ChannelNavKey,
  activeIdx: number,
  count: number,
): number {
  if (count <= 0) return -1;
  switch (key) {
    case "ArrowDown":
      // Coming in from outside: land on the first channel.
      return activeIdx < 0 ? 0 : (activeIdx + 1) % count;
    case "ArrowUp":
      // Coming in from outside: land on the last channel.
      return activeIdx < 0 ? count - 1 : (activeIdx - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
  }
}
