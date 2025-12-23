import { createContext, createEffect, useContext } from "solid-js"
import { createStore } from "solid-js/store"

export interface IPhotoStore {
  /** 数据集合 */
  photos: Photo[];
  /** 是否展示画廊 */
  galleryDisplay: boolean;
  /** 当前激活对象 */
  target: number;
}

export interface IPhotoContext {
  /** 数据集合 */
  store: IPhotoStore;
  /** 更新激活对象 */
  updateTarget: (target: number) => void;
  /** 展示画廊 */
  showGallery: (target?: number) => void;
  /** 隐藏画廊 */
  hideGallery: () => void;
}

export const PhotoContext = createContext<IPhotoContext>();

export const usePhotoContext = () => {
  const context = useContext(PhotoContext)

  if (!context) {
    throw new Error("usePhotoContext: cannot find a PhotoContext")
  }

  return context
}

export function PhotoProvider(props: { children: any, photos: Photo[], target?: number }) {
  const [store, setStore] = createStore<IPhotoStore>({
    photos: props.photos ?? [],
    target: props.target ?? 0,
    galleryDisplay: false,
  });

  const updateTarget = (target: number) => {
    if (target >= 0 && target < store.photos.length) {
      setStore('target', target);
    } else {
      console.warn('Invalid target index:', target);
    }

    console.log('updateTarget called with:', store);
  }

  const showGallery = (target?: number) => {
    if (target !== undefined) {
      updateTarget(target);
    }
    setStore('galleryDisplay', true);
  }

  const hideGallery = () => {
    console.log("=======hide gallery")
    setStore('galleryDisplay', false);
  }

  const contextValue = {
    store,
    updateTarget,
    showGallery,
    hideGallery,
  }
  
  return (
    <PhotoContext.Provider value={contextValue}>
      {props.children}
    </PhotoContext.Provider>
  )
}
