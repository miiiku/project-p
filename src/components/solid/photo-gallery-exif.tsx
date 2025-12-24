import { Show } from "solid-js"

export default function PhotoGalleryExif(props: { photo: Photo }) {
  const photo = () => props.photo

  const exif = () => photo()?.exif || {}

  return (
    <div class="text-center text-white">
      <aside class="aside-block">
        <span class="font-medium">
          <Show when={exif()?.Model}>
            <span class="font-medium">{exif()?.Model}</span>
          </Show>
        </span>
      </aside>

      <aside class="aside-block flex flex-wrap items-center justify-center gap-4">
        <Show when={exif()?.FocalLength}>
          <span class="font-medium">{exif().FocalLength}</span>
        </Show>
        <Show when={exif()?.FNumber} keyed>
          <span class="font-medium">{exif().FNumber}</span>
        </Show>
        <Show when={exif()?.ExposureTime}>
          <span class="font-medium">{exif().ExposureTime.split(' ')[0]}s</span>
        </Show>
        <Show when={exif()?.ISOSpeedRatings}>
          <span class="font-medium">ISO {exif().ISOSpeedRatings}</span>
        </Show>
      </aside>

      <Show when={photo()?.location_info}>
        <aside class="aside-block">
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