interface Photo {
  name: string;
  src: string;
  color: string;
  is_sticky?: boolean;
  clip?: string;
  thumb_img?: string;
  live_video?: string;
  exif?: { [key: string]: any };
  location_info?: { [key: string]: any };
  location_map?: string;
}
