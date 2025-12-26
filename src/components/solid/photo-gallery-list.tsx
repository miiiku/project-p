import * as LivePhotoKit from 'livephotoskit';
import { createEffect, Index, onCleanup, onMount, Show } from "solid-js"
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
      <aside class="flex flex-wrap items-center justify-center gap-4">
        <Show when={exif()?.Model}>
          <aside class="flex items-center gap-1 font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2" />
              <path d="M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
            </svg>

            <span class="font-medium">{exif()?.Model}</span>
          </aside>
        </Show>

        <Show when={exif()?.FocalLength}>
          <aside class='flex items-center gap-1 font-medium'>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 1024 1024"
            >
              <path d="M88.8 636.8c-2.4-4.8-4-10.4-4-16.8 1.6 5.6 3.2 11.2 4 16.8z"></path>
              <path d="M964.8 764l-73.6-19.2c-72 121.6-202.4 206.4-354.4 214.4-210.4 11.2-394.4-127.2-448-322.4-1.6-5.6-2.4-11.2-4-16.8-1.6-24.8 17.6-46.4 42.4-47.2 24.8-1.6 46.4 17.6 47.2 42.4v0.8c44 155.2 190.4 264.8 357.6 255.2 112.8-6.4 209.6-64.8 269.6-150.4l-76-20c0.8-3.2 3.2-6.4 5.6-8l145.6-111.2c6.4-4.8 13.6-3.2 16.8 4.8l71.2 168.8c0.8 1.6 0.8 4.8 0 8.8zM939.2 404c1.6 24.8-17.6 46.4-42.4 47.2s-46.4-17.6-47.2-42.4V408c-44-154.4-190.4-264-357.6-255.2-112.8 6.4-209.6 64.8-269.6 150.4l76.8 20c-0.8 3.2-3.2 6.4-5.6 8l-145.6 112c-6.4 4.8-13.6 2.4-16.8-4.8l-71.2-168c-1.6-3.2-1.6-6.4-0.8-9.6l73.6 19.2c72-121.6 202.4-206.4 354.4-214.4 210.4-11.2 394.4 127.2 448 322.4 0.8 4.8 2.4 10.4 4 16z"></path>
              <path d="M939.2 404c-1.6-5.6-2.4-11.2-4-16.8 1.6 5.6 3.2 11.2 4 16.8zM359.2 671.2v-320H456l58.4 218.4 57.6-218.4h96.8v320h-60V419.2l-63.2 252h-62.4l-63.2-252v252h-60.8z"></path>
            </svg>
            <span>{exif().FocalLength}</span>
          </aside>
        </Show>

        <Show when={exif()?.FNumber} keyed>
          <aside class='flex items-center gap-1 font-medium'>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
              <path d="M3.6 15h10.55" />
              <path d="M6.551 4.938l3.26 10.034" />
              <path d="M17.032 4.636l-8.535 6.201" />
              <path d="M20.559 14.51l-8.535 -6.201" />
              <path d="M12.257 20.916l3.261 -10.034" />
            </svg>
            <span>{exif().FNumber}</span>
          </aside>
        </Show>

        <Show when={exif()?.ExposureTime}>
          <aside class='flex items-center gap-1 font-medium'>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5.636 19.364a9 9 0 1 1 12.728 0" />
              <path d="M16 9l-4 4" />
            </svg>
            <span>{exif().ExposureTime.split(' ')[0]}s</span>
          </aside>
        </Show>

        <Show when={exif()?.ISOSpeedRatings}>
          <aside class='flex items-center gap-1 font-medium'>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 1236 1024"
              fill="currentColor"
            >
              <path d="M1043.320755 0c106.534642 0 193.207547 87.088302 193.207547 194.125283v388.250566c0 26.797887-21.619925 48.524075-48.301887 48.524076s-48.301887-21.726189-48.301887-48.533736v-388.250566c0-53.518491-43.336453-97.057811-96.603773-97.057812H193.207547c-53.267321 0-96.603774 43.548981-96.603773 97.067472v633.324679c0 53.518491 43.336453 97.057811 96.603773 97.057812h850.113208c53.267321 0 96.603774-43.539321 96.603773-97.057812 0-26.807547 21.619925-48.533736 48.301887-48.533736s48.301887 21.735849 48.301887 48.533736c0 107.036981-86.672906 194.125283-193.207547 194.125283H193.207547c-106.534642 0-193.207547-87.088302-193.207547-194.125283v-633.334339C0 87.088302 86.672906 0 193.207547 0zM227.018868 269.350642c26.681962 0 48.301887 21.726189 48.301887 48.524075v380.966641c0 26.807547-21.619925 48.533736-48.301887 48.533736s-48.301887-21.735849-48.301887-48.533736V317.874717c0-26.797887 21.619925-48.524075 48.301887-48.524075z m301.017358 0c67.06234 0 121.624151 53.460528 121.624151 119.180075 0 26.797887-21.619925 48.524075-48.301886 48.524075s-48.301887-21.726189-48.301887-48.524075c0-13.852981-12.722717-22.122264-25.020378-22.122264h-41.858415c-22.383094 0-39.259774 16.384-39.259773 38.110189v6.559396c0 22.141585 17.610868 40.148528 39.259773 40.148528h44.263849c75.061132 0 136.124377 61.275774 136.124378 136.597736v23.059321c0 75.177057-59.797736 134.066717-136.124378 134.066717h-71.931169c-67.57434 0-120.493887-52.23366-120.493887-118.899925 0-26.807547 21.619925-48.533736 48.301887-48.533736s48.301887 21.735849 48.301886 48.533736c0 14.336 12.017509 21.832453 23.890114 21.832453h71.931169c22.528 0 39.520604-15.910642 39.520604-36.999245v-23.059321a39.578566 39.578566 0 0 0-39.520604-39.539925h-44.263849c-74.916226 0-135.863547-61.546264-135.863547-137.206339v-6.559396c0-36.680453 14.249057-70.878189 40.109887-96.313963 25.493736-25.059019 59.498264-38.854038 95.75366-38.854037z m367.963774 0c95.879245 0 173.886792 78.374642 173.886792 174.707924v126.174189c0 96.342943-78.007547 174.717585-173.886792 174.717585s-173.886792-78.374642-173.886792-174.717585V444.058566c0-96.333283 78.007547-174.707925 173.886792-174.707924z m0 97.057811c-42.611925 0-77.283019 34.835321-77.283019 77.650113v126.174189c0 42.824453 34.671094 77.650113 77.283019 77.650113s77.283019-34.82566 77.283019-77.650113V444.058566c0-42.814792-34.671094-77.650113-77.283019-77.650113z"></path>
            </svg>
            <span>{exif().ISOSpeedRatings}</span>
          </aside>
        </Show>
      </aside>

      <Show when={photo()?.location_info}>
        <aside class="flex items-center justify-center gap-1 font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
            <path d="M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0" />
            <path d="M12 2l0 2" />
            <path d="M12 20l0 2" />
            <path d="M20 12l2 0" />
            <path d="M2 12l2 0" />
          </svg>

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
        </aside>
      </Show>

      {/* <Show when={photo()?.location_map}>
        <Popover id="location_map_popover">
          <img src={photo().location_map} class="w-auto h-40 block" alt="Location" />
        </Popover>
      </Show> */}
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
                "--grid-gutter-col": "clamp(6px,3dvh,48px)",
                "--grid-gutter-row": "clamp(6px,2dvw,50px)",
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