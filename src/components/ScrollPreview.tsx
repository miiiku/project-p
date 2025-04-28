import { createSignal, Index, onCleanup, onMount, Show } from "solid-js";
import { getTarget, throttle } from "../utils";

import Popover from './Popover';
import PhotoShow from "./render/PhotoShow";

export default function ScrollPreview(props: { wrapper: string, item: string, photos: Photo[] }) {
  let serviceTargetRoot: HTMLDivElement;
  let scrollPreviewRef: HTMLDivElement;

  let resizeObserverInit: boolean = false;
  let resizeObserver: ResizeObserver;

  const blockSize: number = 64;
  const blockGap: number = 12;

  const [open, setOpen] = createSignal(false);
  const [actIdx, setActIdx] = createSignal(0);
  const [scrollY, setScrollY] = createSignal(0);

  const actPhoto = () => props.photos[actIdx()] || {};

  const updateScrollBar = () => {
    // 更新滚动条
    const count = props.photos.length;
    const clientHeight = window.innerHeight || 0;
    const scrollHeight = (blockSize + blockGap) * count + blockGap;

    if (scrollHeight <= clientHeight) {
      const offset = (clientHeight - scrollHeight) / 2;
      setScrollY(-offset);
    } else {
      const actOffset = (blockSize + blockGap) * actIdx() + blockGap + blockSize / 2;
      const y = actOffset - clientHeight / 2;
      setScrollY(Math.max(0, Math.min(scrollHeight - clientHeight, y)));
    }
  }

  const updateViewBg = () => {
    const { color, src } = actPhoto();
    scrollPreviewRef.style.backgroundColor = color;
    scrollPreviewRef.style.backgroundImage = `url(${src}-640w.webp)`;
  }

  const setSafeIdx = (idx: number) => {
    const safeIdx = Math.max(0, Math.min(props.photos.length - 1, idx));
    setActIdx(safeIdx);
    updateViewBg();
    updateScrollBar();
  }

  onCleanup(() => {
    document.body.style.overflow = 'auto';
    document.removeEventListener('wheel', filterScrollEvent);
    document.removeEventListener('keyup', handleKeyUp);
    resizeObserver?.disconnect();

    // 组件被销毁后，注销服务目标绑定的代理事件
    serviceTargetRoot.removeEventListener('mousedown', handleShow);
  });

  onMount(() => {
    // 服务目标绑定代理事件，用来唤起scroll priview组件
    serviceTargetRoot = document.querySelector(`.${props.wrapper}`) as HTMLDivElement;
    if (!serviceTargetRoot) return;
    serviceTargetRoot.addEventListener('click', handleShow);
  });

  const handleShow = (e: any) => {
    const target = e.target as HTMLElement;
    const isServiceTarget = getTarget(target, (el) => el.classList.contains(props.item));
    if (!isServiceTarget) return;
    show(Number(isServiceTarget.dataset.index));
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      hide();
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      setSafeIdx(actIdx() - 1);
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      setSafeIdx(actIdx() + 1);
    }
  }

  const handleScroll = throttle((e: WheelEvent) => {
    if (e.deltaY > 0) setSafeIdx(actIdx() + 1);
    if (e.deltaY < 0) setSafeIdx(actIdx() - 1);
  }, 100);

  const filterScrollEvent = (e: WheelEvent) => {
    if (Math.abs(e.deltaY) < 3) return;
    handleScroll(e);
  }

  const show = (index: number) => {
    setOpen(true);
    scrollPreviewRef?.showPopover();
    document.body.style.overflow = 'hidden';
    document.addEventListener('wheel', filterScrollEvent);
    document.addEventListener('keyup', handleKeyUp);

    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === scrollPreviewRef) {
          resizeObserverInit && updateScrollBar();
          resizeObserverInit = true;
        }
      }
    });

    resizeObserverInit = false;
    resizeObserver.observe(scrollPreviewRef);

    setSafeIdx(index);
  }

  const hide = () => {
    setOpen(false);
    scrollPreviewRef?.hidePopover();
    document.body.style.overflow = 'auto';
    document.removeEventListener('wheel', filterScrollEvent);
    document.removeEventListener('keyup', handleKeyUp);
    resizeObserver?.disconnect();

    // 让当前展示图片对应的画廊图片滚动到中心位置
    const selector = `.${props.item}[data-index='${actIdx()}']`;
    const targetPhoto = serviceTargetRoot.querySelector(selector) as HTMLDivElement;
    if (targetPhoto) {
      const { top, height } = targetPhoto.getBoundingClientRect();
      const vh = window.innerHeight;
      if (top > vh - height || top < 0) {
        targetPhoto.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  return (
    <div ref={el => scrollPreviewRef = el} popover="manual" class="scroll-preview fixed size-full inset-0 bg-no-repeat bg-center bg-cover bg-white dark:bg-gray-800">
      <div class="preview-wrapper backdrop-blur-[30px] size-full pt-10 pr-22 pb-4 pl-6 grid grid-cols-1 grid-rows-[1fr_auto] gap-y-4">
        {/* photo view */}
        <div class="preview-main size-full flex justify-center items-center overflow-hidden">
          <PhotoShow photo={actPhoto()} />
        </div>

        {/* photo info mix-blend-difference */}
        <div class="preview-info text-center text-white">
          <Show when={actPhoto().exif}>
            <aside class="aside-block">
              <span class="font-medium">
                <Show when={actPhoto().exif?.Model} keyed>
                  { val => <span class="font-medium">{val}</span> }
                </Show>
              </span>
            </aside>

            <aside class="aside-block flex flex-wrap items-center justify-center gap-4">
              <Show when={actPhoto().exif?.FocalLength} keyed>
                { val => <span class="font-medium">{val}</span> }
              </Show>
              <Show when={actPhoto().exif?.FNumber} keyed>
                { val => <span class="font-medium">{val}</span> }
              </Show>
              <Show when={actPhoto().exif?.ExposureTime} keyed>
                { val => <span class="font-medium">{ val.split(' ')[0] }s</span> }
              </Show>
              <Show when={actPhoto().exif?.ISOSpeedRatings} keyed>
                { val => <span class="font-medium">ISO {val}</span> }
              </Show>
            </aside>
          </Show>

          <Show when={actPhoto().location_info} keyed>
            {
              val => (
                <aside class="aside-block">
                  <button
                    popovertarget="location_map_popover"
                    class="text-sm cursor-pointer"
                    title={val?.formatted_address}
                  >
                    { val?.province }
                    { val?.city }
                    { val?.district }
                    { val?.township }
                    { val?.streetName }
                  </button>
                </aside>
              )
            }
          </Show>

          <Show when={actPhoto().location_map} keyed>
            {
              val => (
                <Popover id="location_map_popover">
                  <img src={val} class="w-auto h-40 block" alt="Location" />
                </Popover>
              )
            }
          </Show>
        </div>
      </div>

      {/* right scroll bar */}
      <div class="scrollbar-wrapper absolute inset-y-0 right-0">
        <ul class="scrollbar relative w-22 h-full overflow-y-clip bg-stone-800/5">
          <Index each={props.photos} fallback={<div>Loading...</div>}>
            {
              (photo, index) => (
                <li
                  class="scrollbar-item absolute inset-x-0 mx-auto size-16 cursor-pointer rounded origin-right transition-transform overflow-hidden"
                  style={{
                    transform: `
                      translate3d(0, ${index * (blockSize + blockGap) + blockGap - scrollY()}px, 0)
                      scale(${actIdx() === index ? 1.26 : 1}
                    `
                  }}
                >
                  <img class="scrollbar-img block w-full h-full object-cover" src={`${photo().src}-120w.webp`} alt={photo().name} />
                </li>
              )
            }
          </Index>
        </ul>
      </div>
    </div>
  )
}