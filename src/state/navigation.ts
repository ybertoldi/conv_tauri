import { createSignal } from "solid-js";
import SIDEBAR_ROUTES from "../consts/sidebar_routes";

export const [activeScreen, setActiveScreen] = createSignal(
  SIDEBAR_ROUTES[0]?.id ?? ""
);
