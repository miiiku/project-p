import { createSignal, onCleanup, onMount } from "solid-js";

export default function Popover (props: { id: string, children: any }) {
  let popverRef: HTMLElement;
  let targets: HTMLElement[];
  const [top, setTop] = createSignal(0);
  const [left, setLeft] = createSignal(0);

  const handle = (e: any) => {
    const target = e?.target;
    if (!target || !popverRef) return;
    const { left, top, width } = target.getBoundingClientRect();

    setTop(top - 6);
    setLeft(left + width / 2)
  }

  onMount(() => {
    targets = Array.from(document.querySelectorAll(`[popovertarget="${props.id}"]`));
    // 绑定事件
    if (targets && targets.length) {
      targets.forEach((el => el.addEventListener('click', handle)))
    }
  })

  onCleanup(() => {
    if (targets && targets.length) {
      targets.forEach((el => el.removeEventListener('click', handle)))
    }
  })

  return (
    <div
      popover
      ref={el => popverRef = el} 
      id={props.id}
      class="popover-wrapper"
      style={{ top: `${top()}px`, left: `${left()}px` }}
    >
      { props.children }
    </div>
  )
}