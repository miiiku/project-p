import { PhotoProvider } from "./photo-provider"
import PhotoMasonry from "./photo-masonry"
import PhotoGallery from "./photo-gallery"

export function PhotoRender(props: { photos: any }) {
  return (
    <PhotoProvider photos={props.photos}>
      <PhotoMasonry />
      <PhotoGallery />
    </PhotoProvider>
  )
}