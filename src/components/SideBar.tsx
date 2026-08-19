import { FaSolidChevronLeft, FaSolidChevronRight } from "solid-icons/fa";
import { createSignal, For, Show } from "solid-js";

import SIDEBAR_ROUTES from "../consts/sidebar_routes";
import { activeScreen, setActiveScreen } from "../state/navigation";

function SideBar() {
  const [sideBarToggled, setSideBarToggled] = createSignal(true);

  return (
    <aside
      id="hs-sidebar-header"
      class={`${sideBarToggled() ? "w-64" : "w-[74px]"
        } flex-shrink-0 sticky inset-y-0 bottom-0 z-60 h-screen bg-white border-r border-gray-200 transition-[width] duration-200`}
      role="dialog"
      tabindex="-1"
      aria-label="Sidebar"
    >
      <div class="relative flex flex-col h-full">
        <header
          class={`h-16 shrink-0 flex ${sideBarToggled() ? "justify-between" : "justify-center"
            } items-center gap-x-2 px-4 border-b border-gray-100`}
        >
          <Show when={sideBarToggled()}>
            <span class="flex-none font-semibold text-lg text-gray-900 select-none">
              Conversor
            </span>
          </Show>

          <button
            type="button"
            class="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            onClick={() => setSideBarToggled(!sideBarToggled())}
          >
            <Show
              when={sideBarToggled()}
              fallback={<FaSolidChevronRight size={14} />}
            >
              <FaSolidChevronLeft size={14} />
            </Show>
          </button>
        </header>

        <nav class="flex-1 min-h-0 overflow-y-auto py-3">
          <ul class="flex flex-col gap-1 px-3">
            <For each={SIDEBAR_ROUTES}>
              {(item) => {
                const isActive = () => activeScreen() === item.id;
                return (
                  <li>
                    <button
                      type="button"
                      onClick={() => setActiveScreen(item.id)}
                      title={sideBarToggled() ? undefined : item.nome}
                      class={`group flex items-center w-full h-11 rounded-lg text-sm font-medium transition-colors select-none ${sideBarToggled() ? "gap-3 px-3" : "justify-center"
                        } ${isActive()
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                    >
                      <span
                        class={`flex items-center justify-center shrink-0 ${isActive()
                            ? "text-indigo-600"
                            : "text-gray-400 group-hover:text-gray-600"
                          }`}
                      >
                        {item.icon({})}
                      </span>
                      <Show when={sideBarToggled()}>
                        <span class="truncate">{item.nome}</span>
                      </Show>
                    </button>
                  </li>
                );
              }}
            </For>
          </ul>
        </nav>
      </div>
    </aside>
  );
}

export default SideBar;
