import { Component } from "solid-js";
import SideBar from "./components/SideBar";

function App(props?: { children: Component }) {
  return (
    <div class="flex" >
      <SideBar />
    </div>
  )
}

export default App;
