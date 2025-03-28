interface Photo {
  name: string;
  src: string;
  color: string;
  is_sticky?: boolean;
  clip?: string;
  exif?: string;
  thumb_img?: string;
  live_video?: string;
  location_map?: { [key: string]: any };
  location_info?: { [key: string]: any };
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
