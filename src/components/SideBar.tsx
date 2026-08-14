import { FaSolidChevronLeft, FaSolidChevronRight } from "solid-icons/fa";
import { createSignal, For, Show } from "solid-js";

import SIDEBAR_ROUTES from "../consts/sidebar_routes";

function SideBar() {
  const [sideBarToggled, setSideBarToggled] = createSignal(false);
  const [selected, setSelected] = createSignal(-1);

  return (
    <div id="hs-sidebar-header" class={`translate-x-0 ${sideBarToggled() ? 'w-64' : 'w-[74px]'} bg-gray-100 h-full fixed top-0 inset-s-0 bottom-0 z-60 border-e rounded-md border-gray-300`} role="dialog" tabindex="-1" aria-label="Sidebar" >

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
            <ul class="pb-0 px-2 pt-2 w-full flex flex-col flex-wrap gap-1.5" >

              <For each={SIDEBAR_ROUTES}>
                {(item, id) => (
                  <li>
                    <a
                      class={`${selected() == id() ? 'bg-slate-300' : 'hover:bg-gray-200'} gap-x-5 p-3 h-16 flex  items-center text-md rounded-md focus:outline-hidden select-none`}
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
    </div >
  )
}

export default SideBar;
