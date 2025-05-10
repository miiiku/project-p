import {createEffect, createSignal, Index, onCleanup, onMount} from "solid-js";
import useEventBus from "../hooks/useEventBus.ts";

export default function ScrollBar(props: { index: number, photos: Photo[] }) {
  let resizeObserver: ResizeObserver;
  let scrollBarRootRef: HTMLDivElement;

  const [barDir, setBarDir] = createSignal('y');

  const maxThumbSize: number = 64;
  const minThumbSize: number = 32;
  const maxThumbGap: number = 12;
  const minThumbGap: number = 6;

  const { emit } = useEventBus();

  const updateScrollBar = () => {
    // 更新滚动条
    const count = props.photos.length;
    const clientWidth = window.innerWidth || 0;
    const clientHeight = window.innerHeight || 0;
    const minLength = Math.min(clientWidth, clientHeight);

    const isVert = clientWidth > clientHeight;
    setBarDir(isVert ? 'y' : 'x');

    const thumbSize = Math.max(minThumbSize, Math.min(maxThumbSize, minLength / 12));
    const thumbGap = Math.max(minThumbGap, Math.min(maxThumbGap, minLength / 45));
    const scrollLen = (thumbSize + thumbGap) * count + thumbGap;

    scrollBarRootRef.style.setProperty('--thumb-size', `${thumbSize}`);
    scrollBarRootRef.style.setProperty('--thumb-gap', `${thumbGap}`);
    scrollBarRootRef.style.setProperty('--scrollbar-size', `${thumbSize + thumbGap}`);

    const targetLen = isVert ? clientHeight : clientWidth;

    if (scrollLen <= targetLen) {
      const offset = (targetLen - scrollLen) / 2;
      scrollBarRootRef.style.setProperty('--scroll-offset', `${-offset}`);
    } else {
      const actOffset = (thumbSize + thumbGap) * props.index + thumbGap + thumbSize / 2;
      const y = actOffset - targetLen / 2;
      const offset = Math.max(0, Math.min(scrollLen - targetLen, y));
      scrollBarRootRef.style.setProperty('--scroll-offset', `${offset}`);
    }
  }

  createEffect(() => {
    emit('scrollbar-dir', barDir());
    updateScrollBar();
  })

  onMount(() => {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === scrollBarRootRef) {
          updateScrollBar();
        }
      }
    });
    resizeObserver.observe(scrollBarRootRef);
  })

  onCleanup(() => {
    resizeObserver?.disconnect();
  });

  return (
    <div class="scrollbar-wrapper h-full" ref={el => scrollBarRootRef = el}>
      <ul classList={{
        'scrollbar relative bg-zinc-50/20': true,
        'h-[calc(var(--scrollbar-size)*1px)] w-full overflow-x-clip': barDir() === 'x',
        'w-[calc(var(--scrollbar-size)*1px)] h-full overflow-y-clip': barDir() === 'y',
      }}>
        <Index each={props.photos} fallback={<div>Loading...</div>}>
          {
            (photo, index) => (
              <li
                classList={{
                  'scrollbar-item absolute size-[calc(var(--thumb-size)*1px)] cursor-pointer rounded transition-transform overflow-hidden': true,
                  'inset-y-0 my-auto origin-bottom': barDir() === 'x',
                  'inset-x-0 mx-auto origin-right': barDir() === 'y',
                }}
                style={{
                  transform: `
                    translate3d(
                      ${barDir() === 'x' ? `calc((${index} * (var(--thumb-size) + var(--thumb-gap)) + var(--thumb-gap) - var(--scroll-offset)) * 1px)` : 0},
                      ${barDir() === 'y' ? `calc((${index} * (var(--thumb-size) + var(--thumb-gap)) + var(--thumb-gap) - var(--scroll-offset)) * 1px)` : 0},
                      0
                    )
                    scale(${props.index === index ? 1.26 : 1})
                  `
                }}
              >
                <img
                  class="scrollbar-img block w-full h-full object-cover"
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