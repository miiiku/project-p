const eventBus = new EventTarget()

export default function useEventBus() {
  const addEvent = (event: string, cb: (e: any) => void) => {
    eventBus.addEventListener(event, cb);
  }

  const removeEvent = (event: string, cb: (e: any) => void) => {
    eventBus.removeEventListener(event, cb);
  }

  const emit = (event: string, data: any) => {
    eventBus.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  return { addEvent, removeEvent, emit };
}