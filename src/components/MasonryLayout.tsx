import { For, createSignal, onMount } from "solid-js";

type Props = {
  photos: any[],
}


type LayoutItem = {
  height: number,
  photos: any[],
}

export default function MasonryLayout(props: Props) {

  const [cols, setCols] = createSignal(3);
  const [layout, setLayout] = createSignal<LayoutItem[]>([]);

  const calcLayout = () => {
    const layout: LayoutItem[] = [];

    for (let i = 0; i < cols(); i++) {
      layout.push({ photos: [], height: 0 });
    }

    props.photos.forEach((photo) => {
      const minCol = layout.reduce((min, col, i) => col.height < layout[min].height ? i : min, 0);
      const col = layout[minCol];
      
      col.photos.push(photo);
      col.height += photo.height;
    })

    setLayout(layout);
  }

  const renderItem = (photo: any) => (
    <figure>
      <img class="block w-full h-auto" src={photo?.src} alt={photo?.src} loading="lazy" />
    </figure>
  )

  onMount(() => {
    calcLayout();
  })

  return (
    <div class="masonry-layout" style={{ '--col-count': cols(), '--col-gap': '24px', '--row-gap': '24px' }}>
      <div class="masonry-wrapper grid grid-cols-[repeat(var(--col-count),minmax(0,1fr))] gap-x-(--col-gap) items-start">
        <For each={layout()}>
          {(layout) => (
            <section class="grid grid-cols-1 auto-rows-auto gap-y-(--row-gap)">
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