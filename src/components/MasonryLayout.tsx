import { For, createEffect, createSignal, onMount } from "solid-js";
import useMediaQuery from '../hooks/useMediaQuery';

type Props = {
  photos: Photo[],
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

    props.photos.forEach((photo) => {
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
      col.photos.push(photo);
      col.height += heightRate;
    })

    setLayout(layout);
  }

  const renderItem = (photo: any) => (
    <figure>
      <div
        style={{
          "background-color": photo.color,
          "background-image": `url(${photo.src}-tiny.bmp)`,
        }}
        class="rounded bg-no-repeat bg-cover bg-center overflow-hidden"
      >
        <img
          loading="lazy"
          class="block w-full h-auto object-cover"
          alt={photo.name}
          src={`${photo.src}-1024w.webp`}
          width={photo.info?.width}
          height={photo.info?.height}
          sizes="
            (max-width: 768px) 100vw,
            (max-width: 1366px) 50vw,
            (min-width: 1367px) 33vw,
            100vw
          "
          srcset={`
            ${photo.src}-360w.webp 360w,
            ${photo.src}-480w.webp 480w,
            ${photo.src}-640w.webp 640w,
            ${photo.src}-800w.webp 800w,
            ${photo.src}-1024w.webp 1024w,
            ${photo.src}-1280w.webp 1280w,
            ${photo.src}-1440w.webp 1440w,
            ${photo.src}-1920w.webp 1920w,
            ${photo.src}-2560w.webp 2560w
          `}
        />
      </div>
    </figure>
  )

  createEffect(() => {
    setCols(colsMap[media()] ?? 3);
    calcLayout();
  })


  onMount(() => {
    calcLayout();
  })

  return (
    <div class="masonry-layout" style={{ '--col-count': cols(), '--col-gap': '24px', '--row-gap': '24px' }}>
      <div class="masonry-wrapper grid grid-cols-[repeat(var(--col-count),minmax(0,1fr))] gap-x-(--col-gap) items-start">
        <For each={layout()}>
          {(layout) => (
            <section class="masonry-col grid grid-cols-1 auto-rows-auto gap-y-(--row-gap)">
              <For each={layout.photos}>
                {(photo) => (
                  <div class="masonry-item">
                    {renderItem(photo)}
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