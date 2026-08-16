import { JSX } from "solid-js";
import SideBar from "./components/SideBar";

function App(props: { children: number | boolean | Node | JSX.ArrayElement | (string & {}) | null | undefined; }) {
  return (
    <div class="flex justify-stretch items-stretch">
      <SideBar />
      <main class="p-10 w-full">
        {props.children}
      </main>
    </div>
  )
}

export default App;
