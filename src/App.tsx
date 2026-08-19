import { For } from "solid-js";
import SideBar from "./components/SideBar";
import SIDEBAR_ROUTES from "./consts/sidebar_routes";
import { activeScreen } from "./state/navigation";

function App() {
  return (
    <div class="flex justify-stretch items-stretch h-screen">
      <SideBar />
      <main class="p-10 w-full h-screen overflow-hidden">
        <For each={SIDEBAR_ROUTES}>
          {(route) => (
            <div class={activeScreen() === route.id ? "h-full" : "hidden"}>
              <route.component />
            </div>
          )}
        </For>
      </main>
    </div>
  )
}

export default App;
