export function throttle(fn: (e: WheelEvent) => void, delay = 100) {
  let lastCallTime = 0;
  return (e: WheelEvent) => {
    const now = Date.now();
    if (now - lastCallTime < delay) {
      return;
    }
    lastCallTime = now;
    fn(e);
  };
}

export function getTarget(el: HTMLElement, cb: (target: HTMLElement) => boolean): HTMLElement | null {
  if (cb(el)) return el;

  if (el.parentElement) {
    return getTarget(el.parentElement, cb);
  }

  return null;
}