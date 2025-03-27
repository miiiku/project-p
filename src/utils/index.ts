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

export function gpsCoordinateConverter(coordinate: string) {
  const parts = coordinate.replace(/\s/g, '').split(',');

  const degrees = parseFloat(parts[0]);
  const minutes = parseFloat(parts[1]);
  const seconds = parseFloat(parts[2]);

  if (degrees > 180 || minutes > 59 || seconds > 59.999) {
    console.log('Invalid coordinate');
    return;
  }

  const decimal = (degrees + minutes / 60 + seconds / 3600).toFixed(6);

  return degrees > 0 ? decimal : -decimal;
}