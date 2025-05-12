import {Show} from "solid-js";
import Popover from "../Popover.tsx";

type Props = {
  photo: Photo,
}

export default function PhotoExif(props: Props) {
  const exif = () => props?.photo?.exif || {};

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

      <Show when={props.photo?.location_info}>
        <aside class="aside-block">
          <button
            popovertarget="location_map_popover"
            class="text-sm cursor-pointer"
            title={props.photo.location_info?.formatted_address}
          >
            { props.photo.location_info?.province }
            { props.photo.location_info?.city }
            { props.photo.location_info?.district }
            { props.photo.location_info?.township }
            { props.photo.location_info?.streetName }
          </button>
        </aside>
      </Show>

      <Show when={props.photo?.location_map}>
        <Popover id="location_map_popover">
          <img src={props.photo.location_map} class="w-auto h-40 block" alt="Location" />
        </Popover>
      </Show>
    </div>
  )
}