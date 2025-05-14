import {createEffect, createMemo, Index, onCleanup, onMount, Show} from "solid-js";
import * as LivePhotoKit from 'livephotoskit';
import useEventBus from '../../hooks/useEventBus';

{/* <script is:inline src="https://cdn.apple-livephotoskit.com/lpk/1/livephotoskit.js"></script> */}

type Props = {
  scroll: boolean;
  dir: ShowDir;
  index: number;
  photos: Photo[];
}

function RenderPhotoLive(props: { photo: Photo }) {
  let livePhotoRef: HTMLDivElement;
  let livePhotoPlayer: LivePhotoKit.Player;

  onMount(() => {
    createEffect(() => {
      if (!livePhotoRef) return console.warn('el is null');
      if (!props.photo) return console.warn('props is null');

      const { src, live_video } = props.photo || {};

      if (!livePhotoPlayer) {
        livePhotoPlayer = LivePhotoKit.augmentElementAsPlayer(livePhotoRef, {
          proactivelyLoadsVideo: true,
          effectType: 'live',
          photoSrc: src,
          videoSrc: live_video,
        });

        livePhotoPlayer.addEventListener('error', (ev) => {
          console.log(ev);
        });
      }
    })
  });

  return (
    <div ref={el => livePhotoRef = el} class="preview-image" style={{ width: '100%', height: '100%' }}></div>
  )
}

function RenderPhoto(props: { photo: Photo }) {
  return (
    <Show when={props.photo}>
      <figure class="size-full flex justify-center items-center">
        <img
          alt={props.photo.name}
          src={props.photo.src}
          width={props.photo.info?.width}
          height={props.photo.info?.height}
          style={{
            "background-color": props.photo.color,
            "background-image": `url(${props.photo.src}-tiny.bmp)`
          }}
          class="preview-image object-contain block w-auto h-auto max-w-full max-h-full bg-no-repeat bg-cover bg-center"
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
          <div class="photo-show-item w-screen h-screen shrink-0 snap-center" data-index={index}>
            <Show when={photo().live_video && lazyShow(index)}>
              <RenderPhotoLive photo={photo()} />
            </Show>
            <Show when={!photo().live_video && lazyShow(index)}>
              <RenderPhoto photo={photo()} />
            </Show>
          </div>
        )}
      </Index>
    </div>
  )
}