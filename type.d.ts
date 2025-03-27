interface Photo {
  name: string;
  src: string;
  color: string;
  is_sticky?: boolean;
  clip?: string;
  thumb_img?: string;
  exif?: string;
  live_video?: string;
  location_map?: string;
  location_info?: string;
}

interface PreviewPhoto {
  el: HTMLElement;
  index: number;
  name?: string;
  origin?: string;
  clip?: string;
  color?: string;
  exif?: Record<string, any>;
  live_video?: string;
  location_map?: string;
}
