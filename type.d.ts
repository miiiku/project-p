interface Photo {
  name: string;
  src: string;
  color: string;
  is_sticky?: boolean;
  clip?: string;
  exif?: string;
  live_video?: string;
  location_map?: string;
}

interface ThumbPhoto extends Photo {
  index: number;
}
