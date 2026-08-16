/* @refresh reload */
import { For, render } from "solid-js/web";
import App from "./App";
import "./index.css"
import { Route, Router } from "@solidjs/router";
import SIDEBAR_ROUTES from "./consts/sidebar_routes";

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
});

render(() => (
  <Router root={App}>
    <For each={SIDEBAR_ROUTES}>
      {(route) => <Route path={route.href} component={route.component} />}
    </For>
  </Router>
), document.getElementById("root") as HTMLElement);
