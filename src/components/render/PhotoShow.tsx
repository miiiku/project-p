import { createEffect, Match, Show, Switch } from "solid-js";
import * as LivePhotoKit from 'livephotoskit';

{/* <script is:inline src="https://cdn.apple-livephotoskit.com/lpk/1/livephotoskit.js"></script> */}

type Props = {
  photo: Photo,
}

function RenderPhotoLive(props: Props) {

  let livePhotoRef: HTMLDivElement;
  let livePhotoPlayer: LivePhotoKit.Player;

  createEffect(() => {
    if (!livePhotoRef) return console.warn('el is null');
    if (!props.photo) return console.warn('props is null');

    const { src, live_video } = props.photo || {};

    if (!livePhotoPlayer) {
      livePhotoPlayer = LivePhotoKit.augmentElementAsPlayer(livePhotoRef, {
        proactivelyLoadsVideo: true,
        effectType: 'live',
      });
  
      livePhotoPlayer.addEventListener('error', (ev) => {
        console.log(ev);
      });
    }

    livePhotoPlayer.setProperties({
      photoSrc: src,
      videoSrc: live_video,
    });
  });

  return (
    <div ref={el => livePhotoRef = el} class="preview-image" style={{ width: '100%', height: '100%' }}></div>
  )
}

function RenderPhoto(props: Props) {
  return (
    <Show when={props.photo} keyed>
      {
        photo => (
          <figure>
            <img
              alt={photo.name}
              src={photo.src}
              width={photo.info?.width}
              height={photo.info?.height}
              style={{
                "background-color": photo.color,
                "background-image": `url(${photo.src}-tiny.bmp)`
              }}
              class="preview-image object-cover block max-w-full max-h-full bg-no-repeat bg-cover bg-center"
            />
          </figure>
        )
      }
    </Show>
  )
}

export default function PhotoShow(props: Props) {
  return (
    <Switch fallback={<RenderPhoto photo={props.photo} />}>
      <Match when={props.photo.live_video}>
        <RenderPhotoLive photo={props.photo} />
      </Match>
      <Match when={!props.photo.live_video}>
        <RenderPhoto photo={props.photo} />
      </Match>
    </Switch>
  )
}