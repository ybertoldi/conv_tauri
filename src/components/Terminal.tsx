import { createEffect, For, Show } from "solid-js";
import { FaSolidTerminal } from "solid-icons/fa";

// READ ME FIRST (file 8/8 — last one). The simplest file in the feature:
// just renders `consoleLogs` from useJsonImport.ts (6/8) as scrolling text.
export function Terminal(props: { logs: string[] }) {
  let consoleRef: HTMLDivElement | undefined;

  // `props.logs;` on its own line looks like a no-op, but it's not: merely
  // *reading* props.logs here is what makes this effect Solid-reactive to
  // it — without that read, the effect would only run once at mount (the
  // same "no signal call = no dependency" rule from useConnectionForm.ts,
  // 4/8, except here it's used deliberately to auto-scroll on every new log
  // line, not a bug).
  createEffect(() => {
    props.logs;
    if (consoleRef) consoleRef.scrollTop = consoleRef.scrollHeight;
  });

  return (
    <div class="h-full bg-gray-950 rounded-xl shadow-sm overflow-hidden border border-gray-800 flex flex-col">
      <div class="flex items-center gap-2 px-3 py-2 border-b border-gray-800 bg-gray-900/50 shrink-0">
        <FaSolidTerminal size={11} class="text-gray-400" />
        <span class="text-xs font-medium text-gray-300">Console</span>
      </div>
      <div
        ref={consoleRef}
        class="flex-1 min-h-0 overflow-y-auto px-3 py-2 font-mono text-xs text-gray-300 whitespace-pre-wrap leading-relaxed"
      >
        <Show
          when={props.logs.length > 0}
          fallback={
            <div class="h-full flex items-center justify-center text-gray-600">
              A saída do mongoimport aparecerá aqui
            </div>
          }
        >
          <For each={props.logs}>
            {(log) => (
              <div class={`mb-1.5 ${log.startsWith("$") ? "text-emerald-400" : ""}`}>
                {log}
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  );
}

export default Terminal;
