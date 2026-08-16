import { FaSolidChevronLeft, FaSolidChevronRight } from "solid-icons/fa";
import { createSignal, For, Show } from "solid-js";

import SIDEBAR_ROUTES from "../consts/sidebar_routes";

function SideBar() {
  const [sideBarToggled, setSideBarToggled] = createSignal(true);
  const [selected, setSelected] = createSignal(0);

  return (
    <aside id="hs-sidebar-header" class={` ${sideBarToggled() ? 'w-64' : 'w-[74px]'} bg-gray-100 flex-shrink-0 sticky h-screen inset-y-0 overflow-y-auto inset-s-0 bottom-0 z-60 border-e rounded-md border-gray-300`} role="dialog" tabindex="-1" aria-label="Sidebar" >

      <div class="relative flex flex-col h-full max-h-full ">
        <header class={`p-4 flex ${sideBarToggled() ? 'justify-between' : 'justify-center'} items-center gap-x-2 border-gray-300 border-b-2 rounded-md`}>
          <Show when={sideBarToggled()}>
            <a class="flex-none font-semibold text-xl text-layer-foreground focus:outline-hidden focus:opacity-70 " href="#" aria-label="Brand">{sideBarToggled() ? 'Conversor' : ''}</a>
          </Show>

          <div class="flex hover:bg-gray-200 w-8 h-8 items-center justify-center rounded-sm px-3 cursor-pointer" onClick={() => setSideBarToggled(!sideBarToggled())}>
            <Show when={sideBarToggled()} fallback={<FaSolidChevronRight />}>
              <FaSolidChevronLeft />
            </Show>
          </div>

        </header>

        <nav class="h-full overflow-y-auto">
          <div >
            <ul class="pb-0 px-2 pt-2 w-full flex flex-col flex-wrap gap-1" >

              <For each={SIDEBAR_ROUTES}>
                {(item, id) => (
                  <li>
                    <a
                      class={`${selected() == id() ? 'bg-slate-300' : 'hover:bg-gray-200'} gap-x-5 p-3 h-12 flex  items-center text-md rounded-sm focus:outline-hidden select-none`}
                      href={item.href}
                      onClick={() => setSelected(id())}
                    >
                      {item.icon({})}
                      {sideBarToggled() ? item.nome : ""}
                    </a>
                  </li>
                )
                }
              </For>

            </ul>
          </div>
        </nav>
      </div>
    </aside >
  )
}

export default SideBar;
