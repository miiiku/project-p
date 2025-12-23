import { createEffect, Index, onCleanup, onMount, Show } from "solid-js"
import * as LivePhotoKit from 'livephotoskit';
import { usePhotoContext } from "./photo-provider"

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
    <div ref={el => livePhotoRef = el} class="size-full"></div>
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
      <figure class="size-full flex justify-center items-center">
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

export default function PhotoGalleryList() {
  let containerRef: HTMLDivElement;
  let listRefs: HTMLDivElement[] = [];
  let cleanObserver: () => void;

  const { store } = usePhotoContext()

  const setupScrollSnapObserver = (container: HTMLElement) => {
    let observer = new IntersectionObserver(
      (entrise) => {
        entrise.forEach(entry => {
          const { target, isIntersecting } = entry;
          if (isIntersecting) {
            const { index } = (target as HTMLElement).dataset;
            // 手动滚动 - 更新target
            console.log('intersecting', index);
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
            class="relative size-full overflow-hidden"
          >
            <div
              classList={{
                "bg-no-repeat bg-center bg-cover shrink-0 blur-2xl snap-center": true,
                "absolute inset-0 size-full origin-center scale-110": true,
              }}
              style={{
                "background-color": photo().color,
                "background-image": `url(${photo().src}-640w.webp)`
              }}
            />

            <div class="relative size-full p-12">
              <Show
                when={photo().live_video}
                fallback={<RenderStillPhoto idx={index} photo={photo()} />}
              >
                <RenderLivePhoto idx={index} photo={photo()} />
              </Show>
            </div>
          </div>
        )}
      </Index>
    </div>
  )
}