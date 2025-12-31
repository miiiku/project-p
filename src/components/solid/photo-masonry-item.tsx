import { Show } from "solid-js";

type Props = {
  photo: Photo,
}

export default function PhotoItem(props: Props) {

  const { photo } = props;

  return (
    <figure class="cursor-pointer">
      <div
        style={{
          "background-color": photo.color,
          "background-image": `url(${photo.src}-tiny.bmp)`,
        }}
        class="relative rounded bg-no-repeat bg-cover bg-center overflow-hidden"
      >
        <Show when={photo.live_video}>
          <div class="absolute top-0 left-0">
            <div class="flex items-center gap-1 px-2 py-0.5 rounded-br-sm bg-zinc-50/60 text-zinc-600 text-xs font-mono">
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
                <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                <path d="M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" />
                <path d="M15.9 20.11l0 .01" />
                <path d="M19.04 17.61l0 .01" />
                <path d="M20.77 14l0 .01" />
                <path d="M20.77 10l0 .01" />
                <path d="M19.04 6.39l0 .01" />
                <path d="M15.9 3.89l0 .01" />
                <path d="M12 3l0 .01" />
                <path d="M8.1 3.89l0 .01" />
                <path d="M4.96 6.39l0 .01" />
                <path d="M3.23 10l0 .01" />
                <path d="M3.23 14l0 .01" />
                <path d="M4.96 17.61l0 .01" />
                <path d="M8.1 20.11l0 .01" />
                <path d="M12 21l0 .01" />
              </svg>
              <span>LIVE</span>
            </div>
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
