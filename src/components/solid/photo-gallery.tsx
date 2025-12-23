import { createEffect } from "solid-js";
import { Portal } from "solid-js/web";
import { usePhotoContext } from "./photo-provider";

import PhotoThumbBar from "./photo-thumb-bar";
import PhotoGalleryList from "./photo-gallery-list";

export default function PhotoGallery() {
  const { store, hideGallery } = usePhotoContext();

  let containerRef: HTMLDivElement;

  createEffect(() => {
    if (store.galleryDisplay) {
      containerRef.showPopover();
      containerRef.style.pointerEvents = 'auto';
      document.body.style.overflow = 'hidden';
      document.body.style.pointerEvents = 'none';
    } else {
      containerRef.hidePopover();
      containerRef.style.removeProperty('pointer-events');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('pointer-events');
    }
  })

  return (
    <Portal mount={document.querySelector('body')!}>
      <div
        ref={el => containerRef = el}
        popover="manual"
        class="fixed size-full inset-0 bg-white dark:bg-gray-800"
      >
        <div class="size-full">
          {/* photos scroll content */}
          <PhotoGalleryList />

          {/* photo exif info */}
          <div></div>
        </div>

        {/* photos thumb bar */}
        <PhotoThumbBar />

        {/* close btn */}
        <div class="absolute left-4 top-4 z-10 cursor-pointer" onClick={() => hideGallery()}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5 12h6m3 0h1.5m3 0h.5" />
            <path d="M5 12l4 4" />
            <path d="M5 12l4 -4" />
          </svg>
        </div>
      </div>
    </Portal>
  )
}