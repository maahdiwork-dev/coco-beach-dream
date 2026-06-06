/**
 * Smooth-scroll to the reservation form.
 *
 * Uses a double-scroll: once immediately, once after a short delay. The second
 * call re-corrects the landing position after lazy-loaded images above the form
 * finish loading and shift the layout — which is what caused the "lands in the
 * wrong place, scroll to find the form" bug on mobile.
 */
export function scrollToReservation(): void {
  const go = () => {
    document
      .getElementById("reserver")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  go();
  window.setTimeout(go, 550);
  window.setTimeout(go, 1200);
}
