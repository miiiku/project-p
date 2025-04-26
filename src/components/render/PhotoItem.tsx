import { Show } from "solid-js";
import LiveBadege from "../LiveBadge";

type Props = {
  photo: Photo,
}

export default function PhotoItem(props: Props) {

  const { photo } = props;

  return (
    <figure>
      <div
        style={{
          "background-color": photo.color,
          "background-image": `url(${photo.src}-tiny.bmp)`,
        }}
        class="relative rounded bg-no-repeat bg-cover bg-center overflow-hidden"
      >
        <Show when={photo.live_video} keyed>
          <div class="absolute top-0 left-0">
            <LiveBadege />
          </div>
        </Show>

        <img
          loading="lazy"
          class="block w-full h-auto object-cover"
          alt={photo.name}
          src={`${photo.src}-1024w.webp`}
          width={photo.info?.width}
          height={photo.info?.height}
          sizes="
            (max-width: 768px) 100vw,
            (max-width: 1366px) 50vw,
            (min-width: 1367px) 33vw,
            100vw
          "
          srcset={`
            ${photo.src}-360w.webp 360w,
            ${photo.src}-480w.webp 480w,
            ${photo.src}-640w.webp 640w,
            ${photo.src}-800w.webp 800w,
            ${photo.src}-1024w.webp 1024w,
            ${photo.src}-1280w.webp 1280w,
            ${photo.src}-1440w.webp 1440w,
            ${photo.src}-1920w.webp 1920w,
            ${photo.src}-2560w.webp 2560w
          `}
        />
      </div>
    </figure>
  )
}