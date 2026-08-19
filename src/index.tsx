/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App";
import "./index.css"
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";

// document.addEventListener('DOMContentLoaded', () => {
//   document.addEventListener('contextmenu', (e) => {
//     e.preventDefault();
//   });
// });

const queryClient = new QueryClient();

render(() => (
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
), document.getElementById("root") as HTMLElement);
