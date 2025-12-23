import { createSignal, createEffect, onMount, For } from "solid-js";
import useMediaQuery from "@/hooks/useMediaQuery";
import { usePhotoContext } from "./photo-provider";
import PhotoMasonryItem from "./photo-masonry-item";

interface IMasonryLayoutItem {
  height: number;
  photos: any[];
}

const COLS_MAP: Record<string, number> = {
  'sm': 2,
  'md': 2,
  'lg': 3,
  'xl': 3,
  '2xl': 4,
}

export default function PhotoMasonry() {
  const { store, showGallery } = usePhotoContext();
  const [layout, setLayout] = createSignal<IMasonryLayoutItem[]>([]);
  const [cols, setCols] = createSignal(3);

  const media = useMediaQuery();

  const calcLayout = () => {
    const layout: IMasonryLayoutItem[] = [];

    for (let i = 0; i < cols(); i++) {
      layout.push({ photos: [], height: 0 });
    }

    store?.photos?.forEach((photo, index) => {
      const minCol = layout.reduce((min, col, i) => col.height < layout[min].height ? i : min, 0);
      const col = layout[minCol];
      const { width, height } = photo?.info || { width: 0, height: 0 };
      const heightRate = height / width;
      /**
       * 在设置了图片上下之间的边距以后，会导致有时候看起来瀑布流每次不是在最小高度列进行添加
       * 其实计算的位置是正确的，看起来不是的原因是一列的每一张图片都有上下边距
       * 如果某一列的图片数量比其他列多，那么他获得的边距也就比其他列更多，导致在界面呈现上，可能反而会更高
       * 把所有边距去掉即可看到正确的渲染结果
       */
      col.photos.push({ ...photo, index });
      col.height += heightRate;
    })

    setLayout(layout);
  }

  const handleItemClick = (index: number) => {
    showGallery(index);
  };

  onMount(() => {
    console.log(store.photos)
    createEffect(() => {
      setCols(COLS_MAP[media()] ?? 2);
      calcLayout();
    })
  })

  return (
    <div
      style={{
        '--col-count': cols(),
        '--col-gap': '24px',
        '--row-gap': '24px',
      }}
    >
      <div class="grid grid-cols-[repeat(var(--col-count),minmax(0,1fr))] gap-x-(--col-gap) items-start">
        <For each={layout()}>
          {(layout) => (
            <section class="grid grid-cols-1 auto-rows-auto gap-y-(--row-gap)">
              <For each={layout.photos}>
                {(photo) => (
                  <div data-index={photo.index} onClick={() => handleItemClick(photo.index)}>
                    <PhotoMasonryItem photo={photo} />
                  </div>
                )}
              </For>
            </section>
          )}
        </For>
      </div>
    </div>
  )
}
