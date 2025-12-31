import * as LivePhotoKit from 'livephotoskit';
import { createEffect, Index, onCleanup, onMount, Show } from "solid-js"
import { usePhotoContext } from "./photo-provider"
import Popover from '../Popover';

function RenderLivePhoto(props: { photo: Photo, idx: number }) {
  const { store } = usePhotoContext()

  let livePhotoRef: HTMLDivElement;
  let livePhotoPlayer: LivePhotoKit.Player;
  let init: boolean = false;

  onMount(() => {
    createEffect(() => {
      const lazyShow = Math.abs(props.idx - store.target) < 3;
      if (props.photo && lazyShow && livePhotoRef && !init) {
        if (!livePhotoPlayer) {
          livePhotoPlayer = LivePhotoKit.augmentElementAsPlayer(livePhotoRef, {
            proactivelyLoadsVideo: true,
            effectType: 'live',
            photoSrc: props.photo.src,
            videoSrc: props.photo.live_video,
          });

          livePhotoPlayer.addEventListener('error', (ev) => {
            console.log(ev);
          });
        }

        init = true;
      }
    })
  })

  return (
    <div ref={el => livePhotoRef = el} class="size-full overflow-hidden"></div>
  )
}

function RenderStillPhoto(props: { photo: Photo, idx: number }) {
  const { store } = usePhotoContext()

  let imgRef: HTMLImageElement;
  let init: boolean = false;

  onMount(() => {
    createEffect(() => {
      const lazyShow = Math.abs(props.idx - store.target) < 3;
      if (props.photo && lazyShow && imgRef && !init) {
        imgRef.src = props.photo.src;
        init = true;
      }
    })
  })

  return (
    <Show when={props.photo}>
      <figure class="size-full flex justify-center items-center overflow-hidden">
        <img
          ref={el => imgRef = el}
          alt={props.photo.name}
          width={props.photo.info?.width}
          height={props.photo.info?.height}
          class="object-contain block w-auto h-auto max-w-full max-h-full shadow-lg rounded-lg bg-no-repeat bg-cover bg-center"
          style={{
            "background-color": props.photo.color,
            "background-image": `url(${props.photo.src}-tiny.bmp)`
          }}
        />
      </figure>
    </Show>
  )
}

function PhotoGalleryExif(props: { photo: Photo }) {
  const photo = () => props.photo

  const exif = () => photo()?.exif || {}

  return (
    <div class="flex flex-col gap-3 text-white">
      <section class="flex flex-wrap items-center justify-center gap-4">
        <Show when={exif()?.Model}>
          <aside class="flex items-center gap-1 font-medium">
            <span>{exif()?.Model}</span>
          </aside>
        </Show>

        <Show when={exif()?.FocalLength}>
          <aside class='flex items-center gap-1 font-medium'>
            <span>{exif().FocalLength}</span>
          </aside>
        </Show>

        <Show when={exif()?.FNumber} keyed>
          <aside class='flex items-center gap-1 font-medium'>
            <span>{exif().FNumber}</span>
          </aside>
        </Show>

        <Show when={exif()?.ExposureTime}>
          <aside class='flex items-center gap-1 font-medium'>
            <span>{exif().ExposureTime.split(' ')[0]}s</span>
          </aside>
        </Show>

        <Show when={exif()?.ISOSpeedRatings}>
          <aside class='flex items-center gap-1 font-medium'>
            <span>ISO {exif().ISOSpeedRatings}</span>
          </aside>
        </Show>
      </section>

      <Show when={photo()?.location_info}>
        <section class="flex items-center justify-center gap-1 font-medium">
          <button
            popovertarget="location_map_popover"
            class="text-sm cursor-pointer"
            title={photo().location_info?.formatted_address}
          >
            { photo().location_info?.province }
            { photo().location_info?.city }
            { photo().location_info?.district }
            { photo().location_info?.township }
            { photo().location_info?.streetName }
          </button>
        </section>
      </Show>

      <Show when={photo()?.location_map}>
        <Popover id="location_map_popover">
          <img src={photo().location_map} class="w-auto h-40 block" alt="Location" />
        </Popover>
      </Show>
    </div>
  )
}

export default function PhotoGalleryList() {
  let containerRef: HTMLDivElement;
  let listRefs: HTMLDivElement[] = [];
  let cleanObserver: () => void;

  const { store, updateTarget } = usePhotoContext()

  const setupScrollSnapObserver = (container: HTMLElement) => {
    let observer = new IntersectionObserver(
      (entrise) => {
        entrise.forEach(entry => {
          const { target, isIntersecting } = entry;
          if (isIntersecting) {
            const { index } = (target as HTMLElement).dataset;
            // 手动滚动 - 更新target
            const targetIndex = Number(index)
            if (store.target !== targetIndex) {
              updateTarget(targetIndex)
            }
          }
        })
      },
      {
        root: container,
        threshold: 1,
      }
    )

    if (listRefs.length) {
      listRefs.forEach(target => observer.observe(target));
    }

    return () => observer.disconnect();
  }

  onMount(() => {
    if (containerRef) {
      cleanObserver = setupScrollSnapObserver(containerRef)
    }
    createEffect(() => {
      if (store.galleryDisplay) {
        const target = listRefs[store.target]
        target?.scrollIntoView({
          behavior: 'instant',
          block: 'center',
          inline: 'center',
        })
      }
    })
  })

  onCleanup(() => {
    cleanObserver?.()
  })

  return (
    <div
      ref={el => containerRef = el}
      classList={{
        'size-full scrollbar-hidden snap-mandatory select-none': true,
        'flex-col overflow-y-scroll snap-y': true,
      }}
    >
      <Index each={store.photos} fallback={<div>Loading...</div>}>
        {(photo, index) => (
          <div
            ref={item => listRefs.push(item)}
            data-index={index}
            class="relative size-full shrink-0 snap-center overflow-hidden"
          >
            <div
              classList={{
                "bg-no-repeat bg-center bg-cover blur-2xl": true,
                "size-full origin-center scale-110": true,
              }}
              style={{
                "background-color": photo().color,
                "background-image": `url(${photo().src}-640w.webp)`
              }}
            />

            <div
              class="p-12 flex flex-col gap-4"
              style={{
                "--grid-gutter-col": "clamp(12px,3dvh,48px)",
                "--grid-gutter-row": "clamp(12px,3dvw,50px)",
              }}
              classList={{
                "absolute inset-0 size-full": true,
                "grid grid-cols-[var(--grid-gutter-col)_minmax(0,1fr)_var(--grid-gutter-col)]": true,
                "grid grid-rows-[var(--grid-gutter-row)_minmax(0,1fr)_var(--grid-gutter-row)]": true,
              }}
            >
              <div></div>
              <div></div>
              <div></div>

              <div></div>
              <div class="size-full flex flex-col gap-5">
                <Show
                  when={photo().live_video}
                  fallback={<RenderStillPhoto idx={index} photo={photo()} />}
                >
                  <RenderLivePhoto idx={index} photo={photo()} />
                </Show>

                <Show when={photo().exif}>
                  <PhotoGalleryExif photo={photo()} />
                </Show>
              </div>
              <div></div>
              
              <div></div>
              <div></div>
              <div></div>

            </div>
          </div>
        )}
      </Index>
    </div>
  )
}