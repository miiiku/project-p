import { For, Show, createEffect, createSignal, onMount } from "solid-js";
import useMediaQuery from "../hooks/useMediaQuery";
import PhotoItem from "./render/PhotoItem";
import ScrollPreview from "./ScrollPreview";

type Props = {
  photos: Photo[],
  showPreview?: boolean,
  wrapperClass?: string,
  itemClass?: string,
}

type LayoutItem = {
  height: number,
  photos: any[],
}

export default function MasonryLayout(props: Props) {
  const [cols, setCols] = createSignal(3);
  const [layout, setLayout] = createSignal<LayoutItem[]>([]);

  const media = useMediaQuery();

  const colsMap: Record<string, number> = {
    'sm': 1,
    'md': 2,
    'lg': 3,
    'xl': 3,
    '2xl': 4,
  }

  const calcLayout = () => {
    const layout: LayoutItem[] = [];

    for (let i = 0; i < cols(); i++) {
      layout.push({ photos: [], height: 0 });
    }

    props.photos.forEach((photo, index) => {
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

  createEffect(() => {
    setCols(colsMap[media()] ?? 3);
    calcLayout();
  });

  onMount(() => calcLayout());

  return (
    <>
      <div
        classList={{
          'masonry-layout': true,
          [props.wrapperClass ?? '']: true,
        }}
        style={{
          '--col-count': cols(),
          '--col-gap': '24px',
          '--row-gap': '24px',
        }}
      >
        <div class="masonry-wrapper grid grid-cols-[repeat(var(--col-count),minmax(0,1fr))] gap-x-(--col-gap) items-start">
          <For each={layout()}>
            {(layout) => (
              <section class="masonry-col grid grid-cols-1 auto-rows-auto gap-y-(--row-gap)">
                <For each={layout.photos}>
                  {(photo) => (
                    <div classList={{ "masonry-item": true, [props.itemClass ?? '']: true }} data-index={photo.index}>
                      <PhotoItem photo={photo} />
                    </div>
                  )}
                </For>
              </section>
            )}
          </For>
        </div>
      </div>

      <Show when={props.showPreview} keyed>
        <ScrollPreview wrapper={props.wrapperClass ?? ''} item={props.itemClass ?? ''} photos={props.photos} />
      </Show>
    </>
  )
}