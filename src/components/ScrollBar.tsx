import { createMemo, Index, onCleanup, onMount } from "solid-js";
import useEventBus from "../hooks/useEventBus.ts";

type Props = {
  index: number,
  photos: Photo[],
  dir: ShowDir,
}

export default function ScrollBar(props: Props) {
  let resizeObserver: ResizeObserver;
  let scrollBarRootRef: HTMLDivElement;

  const maxThumbSize: number = 64;
  const minThumbSize: number = 32;
  const maxThumbGap: number = 12;
  const minThumbGap: number = 6;

  const { emit } = useEventBus();

  const updateScrollBar = () => {
    // 更新滚动条
    const index = props.index;
    const count = props.photos.length;
    const clientWidth = window.innerWidth || 0;
    const clientHeight = window.innerHeight || 0;
    const minLength = Math.min(clientWidth, clientHeight);

    const isVert = clientWidth > clientHeight;
    const dir = isVert ? 'y' : 'x'
    emit('show-photo-dir', dir);

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
      const actOffset = (thumbSize + thumbGap) * index + thumbGap + thumbSize / 2;
      const y = actOffset - targetLen / 2;
      const offset = Math.max(0, Math.min(scrollLen - targetLen, y));
      scrollBarRootRef.style.setProperty('--scroll-offset', `${offset}`);
    }
  }

  const handleToPhoto = (idx: number) => {
    const len = Math.abs(idx - props.index);
    emit('show-photo-index', { index: idx, scroll: len === 1 });
  }

  onMount(() => {
    createMemo(() => updateScrollBar());
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
        'h-[calc(var(--scrollbar-size)*1px)] w-full overflow-x-clip': props.dir === 'x',
        'w-[calc(var(--scrollbar-size)*1px)] h-full overflow-y-clip': props.dir === 'y',
      }}>
        <Index each={props.photos} fallback={<div>Loading...</div>}>
          {
            (photo, index) => (
              <li
                classList={{
                  'scrollbar-item absolute size-[calc(var(--thumb-size)*1px)] cursor-pointer rounded transition-transform overflow-hidden': true,
                  'inset-y-0 my-auto origin-bottom': props.dir === 'x',
                  'inset-x-0 mx-auto origin-right': props.dir === 'y',
                }}
                style={{
                  transform: `
                    translate3d(
                      ${props.dir === 'x' ? `calc((${index} * (var(--thumb-size) + var(--thumb-gap)) + var(--thumb-gap) - var(--scroll-offset)) * 1px)` : 0},
                      ${props.dir === 'y' ? `calc((${index} * (var(--thumb-size) + var(--thumb-gap)) + var(--thumb-gap) - var(--scroll-offset)) * 1px)` : 0},
                      0
                    )
                    scale(${props.index === index ? 1.26 : 1})
                  `
                }}
                onClick={() => handleToPhoto(index)}
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