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
      <div class="preview-wrapper size-full grid grid-cols-[1fr_500px]">
        <img ref={el => showImageRef = el} class="preview-image block max-w-full max-h-full object-cover m-auto overflow-hidden" />
        <div class="preview-info p-4 overflow-y-auto">

          <div class="mb-4 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-panel-right-close">
              <rect width="18" height="18" x="3" y="3" rx="2"/>
              <path d="M15 3v18"/>
              <path d="m8 9 3 3-3 3"/>
            </svg>
          </div>

          <Show when={actExif()} fallback={null}>
            <div class="pr-22 grid grid-cols-2 gap-4">
              <aside class="aside-block col-span-2 exif-info-item">
                <p class="text-xs text-gray-400 dark:text-gray-300">设备</p>
                <div class="flex items-center mt-2">
                  <img src="https://unpkg.com/lucide-static@latest/icons/camera.svg" class="w-4 h-4 mr-2 text-accent" alt="Device" />
                  <span class="font-medium">Apple - iPhone 14 Pro</span>
                </div>
              </aside>

              <aside class="aside-block exif-info-item">
                <p class="text-xs text-gray-400 dark:text-gray-300">光圈</p>
                <div class="flex items-center mt-2">
                  <img src="https://unpkg.com/lucide-static@latest/icons/aperture.svg" class="w-4 h-4 mr-2 text-accent" alt="FNumber" />
                  <span class="font-medium">f/1.6</span>
                </div>
              </aside>

              <aside class="aside-block exif-info-item">
                <p class="text-xs text-gray-400 dark:text-gray-300">快门速度</p>
                <div class="flex items-center mt-2">
                  <img src="https://unpkg.com/lucide-static@latest/icons/timer.svg" class="w-4 h-4 mr-2 text-accent" alt="ShutterSpeedValue" />
                  <span class="font-medium">1/3876</span>
                </div>
              </aside>

              <aside class="aside-block exif-info-item">
                <p class="text-xs text-gray-400 dark:text-gray-300">ISO感光度</p>
                <div class="flex items-center mt-2">
                  <img src="https://unpkg.com/lucide-static@latest/icons/zap.svg" class="w-4 h-4 mr-2 text-accent" alt="ISOSpeedRatings" />
                  <span class="font-medium">ISO 50</span>
                </div>
              </aside>

              <aside class="aside-block exif-info-item">
                <p class="text-xs text-gray-400 dark:text-gray-300">焦距</p>
                <div class="flex items-center mt-2">
                  <img src="https://unpkg.com/lucide-static@latest/icons/focus.svg" class="w-4 h-4 mr-2 text-accent" alt="FocalLength" />
                  <span class="font-medium">5.1 mm</span>
                </div>
              </aside>

              <aside class="aside-block exif-info-item">
                <p class="text-xs text-gray-400 dark:text-gray-300">曝光模式</p>
                <div class="flex items-center mt-2">
                  <img src="https://unpkg.com/lucide-static@latest/icons/sun.svg" class="w-4 h-4 mr-2 text-accent" alt="ExposureMode" />
                  <span class="font-medium">自动曝光</span>
                </div>
              </aside>

              <aside class="aside-block exif-info-item">
                <p class="text-xs text-gray-400 dark:text-gray-300">曝光补偿</p>
                <div class="flex items-center mt-2">
                  <img src="https://unpkg.com/lucide-static@latest/icons/sun.svg" class="w-4 h-4 mr-2 text-accent" alt="ExposureBiasValue" />
                  <span class="font-medium">0.00 EV</span>
                </div>
              </aside>

              <aside class="aside-block col-span-2 exif-info-item">
                <p class="text-xs text-gray-400 dark:text-gray-300">拍摄位置</p>
                <div class="flex items-center mt-2">
                  <img src="https://qn.sukoshi.xyz/project-p/maps/IMG_2474.png" class="w-full h-auto block" alt="Location" />
                </div>
              </aside>
            </div>
          </Show>
        </div>
      </div>

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