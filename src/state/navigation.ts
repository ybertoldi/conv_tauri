import { createEffect, createSignal } from "solid-js";
import SIDEBAR_ROUTES from "../consts/sidebar_routes";


export const [activeScreen, setActiveScreen] = createSignal(
  localStorage.getItem("last-screen") || SIDEBAR_ROUTES[0]?.id
);

createEffect(() => {
  localStorage["last-screen"] = activeScreen()
});
