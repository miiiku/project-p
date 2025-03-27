import { createEffect, createSignal, Index, onCleanup, onMount, Show } from "solid-js";
import { getTarget, throttle } from "../utils";

export default function ScrollPreview(props: { wrapper: string, item: string, photos: Photo[] }) {
  let serviceTargetRoot: HTMLDivElement;

  let scrollPreviewRef: HTMLDivElement;
  let showImageRef: HTMLImageElement;
  let scrollbarRef: HTMLUListElement;

  let resizeObserver: ResizeObserver;

  const blockSize: number = 64;
  const blockGap: number = 12;

  const [activeIndex, setActiveIndex] = createSignal(0);
  const [scrollY, setScrollY] = createSignal(0);

  const actPhoto = () => props.photos[activeIndex()];

  const actExif = () => {
    const exif = actPhoto().exif;
    try {
      return exif ? JSON.parse(exif) : null;
    } catch (error) {
      return null;
    }
  }

  const actLocationInfo = () => {
    const locationInfo = actPhoto().location_info;
    try {
      return locationInfo ? JSON.parse(locationInfo) : null;
    } catch (error) {
      return null;
    }
  }

  const update = () => {
    if (!showImageRef || !scrollbarRef) return console.log('showImageRef or scrollbarRef is not defined');

    // 更新主视图
    scrollPreviewRef.style.backgroundImage = `url(${actPhoto().src}-8bmp)`;
    showImageRef.src = actPhoto().src;
    showImageRef.alt = actPhoto().name;

    // 更新滚动条
    const count = props.photos.length;
    const clientHeight = scrollbarRef.clientHeight || 0;
    const scrollHeight = (blockSize + blockGap) * count + blockGap;

    if (scrollHeight <= clientHeight) {
      const offset = (clientHeight - scrollHeight) / 2;
      setScrollY(-offset);
    } else {
      const actOffset = (blockSize + blockGap) * activeIndex() + blockGap + blockSize / 2;
      const y = actOffset - clientHeight / 2;
      setScrollY(Math.max(0, Math.min(scrollHeight - clientHeight, y)));
    }
  }

  createEffect(update);

  onCleanup(() => {
    document.removeEventListener('wheel', filterScrollEvent);
    document.removeEventListener('keyup', handleKeyUp);
    serviceTargetRoot.removeEventListener('mousedown', handleShow);
    resizeObserver?.disconnect();
  });

  onMount(() => {
    serviceTargetRoot = document.querySelector(`.${props.wrapper}`) as HTMLDivElement;
    
    serviceTargetRoot.addEventListener('mousedown', handleShow);

    scrollPreviewRef.addEventListener('toggle', (e: any) => {
      if (e.newState === 'open') show();
      if (e.newState === 'closed') hide();
    })
  });

  const handleShow = (e: any) => {
    const target = e.target as HTMLElement;
    const isServiceTarget = getTarget(target, (el) => el.classList.contains(props.item));
    if (!isServiceTarget) return;
    show(Number(isServiceTarget.dataset.index));
  }

  const handleScroll = throttle((e: WheelEvent) => {
    const count = props.photos.length;

    if (e.deltaY > 0) {
      setActiveIndex((prev) => Math.min(count - 1, prev + 1));
    }
    if (e.deltaY < 0) {
      setActiveIndex((prev) => Math.max(0, prev - 1));
    }
  }, 100);

  const filterScrollEvent = (e: WheelEvent) => {
    if (Math.abs(e.deltaY) < 3) return;
    handleScroll(e);
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      hide();
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      setActiveIndex((prev) => Math.max(0, prev - 1));
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      setActiveIndex((prev) => Math.min(props.photos.length - 1, prev + 1));
    }
  }

  const show = (index?: number) => {
    scrollPreviewRef?.showPopover();
    document.body.style.overflow = 'hidden';
    document.addEventListener('wheel', filterScrollEvent);
    document.addEventListener('keyup', handleKeyUp);

    resizeObserver = new ResizeObserver(() => update());
    resizeObserver.observe(scrollPreviewRef);

    if (index !== undefined) {
      setActiveIndex(index);
    }

    update();
  }

  const hide = () => {
    scrollPreviewRef?.hidePopover();
    document.body.style.overflow = 'auto';
    document.removeEventListener('wheel', filterScrollEvent);
    document.removeEventListener('keyup', handleKeyUp);
    resizeObserver?.disconnect();

    // 让当前展示图片对应的画廊图片滚动到中心位置
    const selector = `.${props.item}[data-index='${activeIndex()}']`;
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
      <div class="preview-wrapper size-full pt-10 pr-22 pb-4 pl-6 grid grid-cols-1 grid-rows-[1fr_auto] gap-y-4">
        {/* photo view */}
        <div class="preview-main size-full overflow-hidden">
          <img ref={el => showImageRef = el} class="preview-image block max-w-full max-h-full object-cover m-auto" />
        </div>

        {/* photo info */}
        <div class="preview-info text-center">
          <Show when={actExif()} fallback={null}>
            <aside class="aside-block">
              <span class="font-medium">
                {actExif()?.Make?.val} - {actExif()?.Model?.val}
              </span>
            </aside>

            <aside class="aside-block flex items-center justify-center gap-4">
              <span class="font-medium">
                { actExif()?.FocalLength?.val }
              </span>
              <span class="font-medium">
                { actExif()?.FNumber?.val }
              </span>
              <span class="font-medium">
                { actExif()?.ExposureTime?.val?.split(' ')[0] }s
              </span>
              <span class="font-medium">
                ISO { actExif()?.ISOSpeedRatings?.val }
              </span>
            </aside>

            <Show when={actLocationInfo()}>
              <aside class="aside-block">
                <button
                  popovertarget="location_map_popover"
                  class="text-sm cursor-pointer"
                  title={actLocationInfo()?.formatted_address}
                >
                  { actLocationInfo()?.formatted_address }
                </button>

                <div popover id="location_map_popover" class="rounded p-4 bg-zinc-100 dark:bg-zinc-800">
                  <img src={actPhoto().location_map} class="w-auto h-40 block" alt="Location" />
                </div>
              </aside>
            </Show>
          </Show>
        </div>
      </div>

      {/* right scroll bar */}
      <div class="scrollbar-wrapper absolute inset-y-0 right-0">
        <ul ref={el => scrollbarRef = el} class="scrollbar relative w-22 h-full overflow-y-clip bg-stone-800/5">
          <Index each={props.photos} fallback={<div>Loading...</div>}>
            {
              (photo, index) => (
                <li
                  class="scrollbar-item absolute inset-x-0 mx-auto size-16 cursor-pointer rounded origin-right transition-transform overflow-hidden"
                  style={{
                    transform: `
                      translate3d(0, ${index * (blockSize + blockGap) + blockGap - scrollY()}px, 0)
                      scale(${activeIndex() === index ? 1.26 : 1}
                    `
                  }}
                >
                  <img class="scrollbar-img block w-full h-full object-cover" src={`${photo().src}-r30.webp`} alt={photo().name} />
                </li>
              )
            }
          </Index>
        </ul>
      </div>
    </div>
  )
}