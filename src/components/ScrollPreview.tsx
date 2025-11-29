import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { getTarget } from "../utils";
import useEventBus from "../hooks/useEventBus.ts";

import ScrollBar from "./ScrollBar";
import PhotoExif from "./render/PhotoExif";
import PhotoShow from "./render/PhotoShow";

export default function ScrollPreview(props: { wrapper: string, item: string, photos: Photo[] }) {
  let serviceTargetRoot: HTMLDivElement;
  let scrollPreviewRef: HTMLDivElement;

  const { addEvent, removeEvent } = useEventBus();

  const [actIdx, setActIdx] = createSignal<number>(0);
  const [showDir, setShowDir] = createSignal<ShowDir>('y');
  // NOTE 不展示则直接切换到对应元素，手动滑动到时候固定设置为不展示避免无效滚动
  const [showScroll, setShowScroll] = createSignal<boolean>(false);

  const actPhoto = () => props.photos[actIdx()] || {};

  const updateSafeIdx = (idx: number, scroll: boolean) => {
    const safeIdx = Math.max(0, Math.min(props.photos.length - 1, idx));
    setShowScroll(scroll);
    setActIdx(safeIdx);
    updateViewBg();
  }

  const updateViewBg = () => {
    // const { color, src } = actPhoto();
    // scrollPreviewRef.style.backgroundColor = color;
    // scrollPreviewRef.style.backgroundImage = `url(${src}-640w.webp)`;
  }

  const handlePhotoIndex = ({ detail }: CustomEvent<{ index: number, scroll: boolean }>) => {
    updateSafeIdx(detail.index, detail.scroll);
  }

  const handlePhotoDir = ({ detail }: CustomEvent<ShowDir>) => {
    setShowDir(detail);
  }

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
      updateSafeIdx(actIdx() - 1, true);
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      updateSafeIdx(actIdx() + 1, true);
    }
  }

  const show = (index: number) => {
    scrollPreviewRef?.showPopover();
    document.body.style.overflow = 'hidden';
    document.addEventListener('keyup', handleKeyUp);
    updateSafeIdx(index, false);
  }

  const hide = () => {
    scrollPreviewRef?.hidePopover();
    document.body.style.overflow = 'auto';
    document.removeEventListener('keyup', handleKeyUp);
    // 让当前展示图片对应的画廊图片滚动到中心位置
    const selector = `.${props.item}[data-index='${actIdx()}']`;
    const targetPhoto = serviceTargetRoot.querySelector(selector) as HTMLDivElement;
    if (targetPhoto) {
      const { top, height } = targetPhoto.getBoundingClientRect();
      const vh = window.innerHeight;
      if (top > vh - height || top < 0) {
        targetPhoto.scrollIntoView({ block: 'center' });
      }
    }
  }

  onMount(() => {
    addEvent('show-photo-dir', handlePhotoDir);
    addEvent('show-photo-index', handlePhotoIndex);
    // 服务目标绑定代理事件，用来唤起scroll preview组件
    serviceTargetRoot = document.querySelector(`.${props.wrapper}`) as HTMLDivElement;
    serviceTargetRoot?.addEventListener('click', handleShow);
  });

  onCleanup(() => {
    document.body.style.overflow = 'auto';
    document.removeEventListener('keyup', handleKeyUp);
    removeEvent('show-photo-dir', handlePhotoDir);
    removeEvent('show-photo-index', handlePhotoIndex);
    // 组件被销毁后，注销服务目标绑定的代理事件
    serviceTargetRoot?.removeEventListener('mousedown', handleShow);
  });

  return (
    <div ref={el => scrollPreviewRef = el} popover="manual" class="scroll-preview fixed size-full inset-0 bg-no-repeat bg-center bg-cover bg-white dark:bg-gray-800">
      <div class="preview-wrapper backdrop-blur-[30px] w-screen h-screen">
        {/* photo view */}
        <div class="preview-main">
          <PhotoShow
            scroll={showScroll()}
            dir={showDir()}
            index={actIdx()}
            photos={props.photos}
          />
        </div>

        {/* photo info mix-blend-difference */}
        <Show when={actPhoto().exif}>
          <div class="preview-info">
            <PhotoExif photo={actPhoto()} />
          </div>
        </Show>
      </div>

      {/* scroll bar */}
      <div classList={{
        'absolute': true,
        'inset-y-0 right-0': showDir() === 'y',
        'inset-x-0 bottom-0': showDir() === 'x',
      }}>
        <ScrollBar
          dir={showDir()}
          index={actIdx()}
          photos={props.photos}
        />
      </div>
    </div>
  )
}