import { createEffect, createSignal, Index, onCleanup, onMount } from "solid-js";
import useEventBus from "@/hooks/useEventBus";
import { usePhotoContext } from "./photo-provider"

const maxThumbSize = 64;
const minThumbSize = 32;
const maxThumbGap = 12;
const minThumbGap = 6;

export default function PhotoThumbBar() {
  const { store, updateTarget } = usePhotoContext()
  const { emit } = useEventBus();

  let resizeObserver: ResizeObserver;
  let containerRef: HTMLDivElement;

  const [dir, setDir] = createSignal('x')

  const handleToPhoto = (idx: number) => {
    const len = Math.abs(idx - (store.target));
    updateTarget(idx)
    emit('show-photo-index', { index: idx, scroll: len === 1 });
  }

  const updateThumbBar = () => {
    const index = store.target;
    const count = store.photos.length;
    const clientWidth = window.innerWidth ?? 0;
    const clientHeight = window.innerHeight ?? 0;
    const minLength = Math.min(clientWidth, clientHeight);

    const isVert = clientWidth > clientHeight;
    setDir(isVert ? 'y' : 'x');

    const thumbSize = Math.max(minThumbSize, Math.min(maxThumbSize, minLength / 12));
    const thumbGap = Math.max(minThumbGap, Math.min(maxThumbGap, minLength / 45));
    const scrollLen = (thumbSize + thumbGap) * count + thumbGap;

    containerRef.style.setProperty('--thumb-size', `${thumbSize}`);
    containerRef.style.setProperty('--thumb-gap', `${thumbGap}`);
    containerRef.style.setProperty('--thumb-bar-size', `${thumbSize + thumbGap}`);

    const targetLen = isVert ? clientHeight : clientWidth;

    if (scrollLen <= targetLen) {
      const offset = (targetLen - scrollLen) / 2;
      containerRef.style.setProperty('--scroll-offset', `${-offset}`);
    } else {
      const actOffset = (thumbSize + thumbGap) * index + thumbGap + thumbSize / 2;
      const y = actOffset - targetLen / 2;
      const offset = Math.max(0, Math.min(scrollLen - targetLen, y));
      containerRef.style.setProperty('--scroll-offset', `${offset}`);
    }
  }

  onMount(() => {
    createEffect(() => updateThumbBar())
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === containerRef) {
          updateThumbBar();
        }
      }
    });
    resizeObserver.observe(containerRef);
  })

  onCleanup(() => {
    resizeObserver?.disconnect();
  })

  return (
    <div
      ref={el => containerRef = el}
      classList={{
        'absolute': true,
        'inset-y-0 right-0': dir() === 'y',
        'inset-x-0 bottom-0': dir() === 'x',
      }}
    >
      <ul
        classList={{
          'thumb-bar relative bg-zinc-50/20': true,
          'h-[calc(var(--thumb-bar-size)*1px)] w-full overflow-x-clip': dir() === 'x',
          'w-[calc(var(--thumb-bar-size)*1px)] h-full overflow-y-clip': dir() === 'y',
        }}
      >
        <Index each={store.photos} fallback={<div>Loading...</div>}>
          {
            (photo, index) => (
              <li
                classList={{
                  'thumb-bar-item absolute size-[calc(var(--thumb-size)*1px)] cursor-pointer rounded transition-transform overflow-hidden': true,
                  'inset-y-0 my-auto origin-bottom': dir() === 'x',
                  'inset-x-0 mx-auto origin-right': dir() === 'y',
                }}
                style={{
                  transform: `
                    translate3d(
                      ${dir() === 'x' ? `calc((${index} * (var(--thumb-size) + var(--thumb-gap)) + var(--thumb-gap) - var(--scroll-offset)) * 1px)` : 0},
                      ${dir() === 'y' ? `calc((${index} * (var(--thumb-size) + var(--thumb-gap)) + var(--thumb-gap) - var(--scroll-offset)) * 1px)` : 0},
                      0
                    )
                    scale(${store.target === index ? 1.26 : 1})
                  `
                }}
                onClick={() => handleToPhoto(index)}
              >
                <img
                  class="thumb-bar-img block w-full h-full object-cover"
                  src={`${photo().src}-120w.webp`}
                  alt={photo().name}
                />
              </li>
            )
          }
        </Index>
      </ul>
    </div>
  )
}