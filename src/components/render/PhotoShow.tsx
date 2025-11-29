import {createEffect, createMemo, Index, onCleanup, onMount, Show} from "solid-js";
import * as LivePhotoKit from 'livephotoskit';
import useEventBus from '../../hooks/useEventBus';

type Props = {
  scroll: boolean;
  dir: ShowDir;
  index: number;
  photos: Photo[];
}

function RenderPhotoLive(props: { photo: Photo, show: boolean }) {
  let livePhotoRef: HTMLDivElement;
  let livePhotoPlayer: LivePhotoKit.Player;
  let init = false;

  onMount(() => {
    createEffect(() => {
      const { photo, show } = props;
      if (photo && show && livePhotoRef && !init) {

        if (!livePhotoPlayer) {
          livePhotoPlayer = LivePhotoKit.augmentElementAsPlayer(livePhotoRef, {
            proactivelyLoadsVideo: true,
            effectType: 'live',
            photoSrc: photo.src,
            videoSrc: photo.live_video,
          });

          livePhotoPlayer.addEventListener('error', (ev) => {
            console.log(ev);
          });
        }

        init = true;
      }
    })
  });

  return (
    <div ref={el => livePhotoRef = el} class="preview-image size-full"></div>
  )
}

function RenderPhoto(props: { photo: Photo, show: boolean }) {
  let imgRef: HTMLImageElement;
  let init = false;

  onMount(() => {
    createEffect(() => {
      const { photo, show } = props;
      if (photo && show && imgRef && !init) {
        imgRef.src = photo.src;
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
          style={{
            "background-color": props.photo.color,
            "background-image": `url(${props.photo.src}-tiny.bmp)`
          }}
          class="preview-image object-contain block w-auto h-auto max-w-full max-h-full shadow-lg rounded-lg bg-no-repeat bg-cover bg-center"
        />
      </figure>
    </Show>
  )
}

export default function PhotoShow(props: Props) {
  let wrapper: HTMLDivElement;

  let cleanObserver: () => void;

  const { emit } = useEventBus();

  const setupScrollSnapObserver = (container: HTMLElement) => {
    let observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const { target, isIntersecting } = entry;
          if (isIntersecting) {
            const { index } = (target as HTMLElement).dataset;
            emit('show-photo-index', { index, scroll: false });
          }
        })
      },
      {
        root: container,
        threshold: 1,
      }
    );

    const items = container.querySelectorAll('.photo-show-item') || [];

    items.forEach(target => observer.observe(target));

    return () => observer.disconnect();
  }

  const lazyShow = (index: number) => {
    return Math.abs(index - props.index) < 3;
  }

  onMount(() => {
    if (wrapper) {
      cleanObserver = setupScrollSnapObserver(wrapper);
      createMemo(() => {
        const selector = `.photo-show-item[data-index='${props.index}']`;
        const target = wrapper.querySelector(selector);
        console.log('=========== scroll', props.index, props.scroll)
        target?.scrollIntoView({
          behavior: props.scroll ? 'smooth' : 'instant',
          block: 'center',
          inline: 'center',
        })
      })
    }
  })

  onCleanup(() => {
    cleanObserver?.();
  })

  return (
    <div
      ref={el => wrapper = el}
      classList={{
        'photo-show w-screen h-screen flex scrollbar-hidden snap-mandatory select-none': true,
        'flex-row overflow-x-scroll snap-x': props.dir === 'x',
        'flex-col overflow-y-scroll snap-y': props.dir === 'y',
      }}
    >
      <Index each={props.photos} fallback={<div>Loading...</div>}>
        {(photo, index: number) => (
          <div
            data-index={index}
            data-src={photo().src}
            classList={{
              'bg-no-repeat bg-center bg-cover': true,
              'photo-show-item w-screen h-screen shrink-0 snap-center': true,
            }}
            style={{
              "background-color": photo().color,
              "background-image": `url(${photo().src}-640w.webp)`
            }}
          >
            <div class="size-full p-12 backdrop-blur-[30px]">
              <Show when={photo().live_video}>
                <RenderPhotoLive photo={photo()} show={lazyShow(index)} />
              </Show>
              <Show when={!photo().live_video}>
                <RenderPhoto photo={photo()} show={lazyShow(index)} />
              </Show>
            </div>
          </div>
        )}
      </Index>
    </div>
  )
}