import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { createColumnHelper, createTable, tableFeatures } from "@tanstack/solid-table";
import {
  FaSolidCircleCheck,
  FaSolidCircleXmark,
  FaSolidClock,
  FaSolidDatabase,
  FaSolidFolderOpen,
  FaSolidPlay,
  FaSolidSpinner,
} from "solid-icons/fa";
import { PanelHeader } from "./PanelHeader";
import Field from "./Field";

// READ ME FIRST (file 7/8). Pure UI: renders everything useJsonImport.ts
// (6/8) returns — the path field, the file table, and the import button.
// Two things worth understanding here:
//
// 1. `draftPath` (below, in DirSelector) — a local signal that mirrors the
//    `selectedPath` prop via `createEffect(() => setDraftPath(props.selectedPath))`.
//    Why not just use `props.selectedPath` directly as the input's value?
//    Because typing needs somewhere to live *before* it's committed — the
//    input updates draftPath on every keystroke (via Field's onInput), but
//    only calls back up to the parent (onPathBlur) when you leave the
//    field. If the input were bound straight to props.selectedPath, there'd
//    be nowhere to hold in-progress typing that hasn't been validated yet.
//    The createEffect is what keeps draftPath in sync when selectedPath
//    changes from OUTSIDE typing (e.g. picking a folder via the dialog).
//
// 2. The file table uses @tanstack/solid-table, a *headless* table library
//    (same "headless" idea as Ark UI in MongoForm.tsx, 5/8, just for
//    tables instead of a combobox) — it computes rows/columns/headers for
//    you, you render the actual <table> markup yourself with FlexRender.
export interface JsonFile {
  name: string;
  collectionName: string;
  status: "pending" | "running" | "success" | "error";
}

const STATUS_META = {
  pending: {
    label: "Pendente",
    class: "bg-gray-100 text-gray-600",
    icon: FaSolidClock,
  },
  running: {
    label: "Importando",
    class: "bg-blue-50 text-blue-700",
    icon: FaSolidSpinner,
  },
  success: {
    label: "Concluído",
    class: "bg-emerald-50 text-emerald-700",
    icon: FaSolidCircleCheck,
  },
  error: {
    label: "Erro",
    class: "bg-red-50 text-red-700",
    icon: FaSolidCircleXmark,
  },
} as const;

function StatusBadge(props: { status: JsonFile["status"] }) {
  const meta = () => STATUS_META[props.status];
  return (
    <span
      class={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${meta().class}`}
    >
      <span class={props.status === "running" ? "animate-spin" : ""}>
        {meta().icon({ size: 11 })}
      </span>
      {meta().label}
    </span>
  );
}

// Table model inputs (features + column helper) are kept module-level and
// stable, per TanStack Table v9 guidance — only `data` should change.
const fileTableFeatures = tableFeatures({});
const fileColumnHelper = createColumnHelper<typeof fileTableFeatures, JsonFile>();

export function DirSelector(props: {
  selectedPath: string;
  files: JsonFile[];
  isImporting: boolean;
  onSelectDirectory: () => void;
  onPathBlur: (path: string) => void;
  onUpdateCollectionName: (index: number, value: string) => void;
  onImport: () => void;
}) {
  const [draftPath, setDraftPath] = createSignal("");
  createEffect(() => setDraftPath(props.selectedPath));
  const summary = createMemo(() => {
    const list = props.files;
    return {
      total: list.length,
      success: list.filter((f) => f.status === "success").length,
      error: list.filter((f) => f.status === "error").length,
    };
  });

  const fileColumns = fileColumnHelper.columns([
    fileColumnHelper.accessor("name", {
      header: "Arquivo",
      cell: (info) => (
        <span class="text-sm text-gray-700 font-mono">{info.getValue()}</span>
      ),
    }),
    fileColumnHelper.accessor("collectionName", {
      header: "Collection",
      cell: (info) => (
        <input
          type="text"
          value={info.getValue()}
          onInput={(e) =>
            props.onUpdateCollectionName(info.row.index, e.currentTarget.value)
          }
          disabled={props.isImporting}
          class="w-full max-w-[220px] px-2 py-1 text-sm rounded-md border-0 bg-gray-50 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 transition-shadow"
        />
      ),
    }),
    fileColumnHelper.accessor("status", {
      header: "Status",
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
  ]);

  // `get data()` (a getter, not a plain `data: props.files`) is what makes
  // this reactive to Solid — createTable reads `.data` internally, and a
  // getter re-runs that read every time, same reason components use
  // `props.x` instead of destructuring it. A plain property would only
  // ever capture whatever `props.files` was at this one call.
  const filesTable = createTable({
    features: fileTableFeatures,
    columns: fileColumns,
    get data() {
      return props.files;
    },
  });

  return (
    <div class="h-full bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col">
      <PanelHeader
        title="Arquivos JSON"
        icon={FaSolidDatabase}
        right={
          <Show when={props.files.length > 0}>
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <span>{summary().total} arquivo(s)</span>
              <Show when={summary().success > 0}>
                <span class="text-emerald-600 font-medium">
                  · {summary().success} ok
                </span>
              </Show>
              <Show when={summary().error > 0}>
                <span class="text-red-600 font-medium">
                  · {summary().error} erro
                </span>
              </Show>
            </div>
          </Show>
        }
      />

      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={props.onSelectDirectory}
          disabled={props.isImporting}
          class="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FaSolidFolderOpen size={13} />
        </button>
        <div class="flex-1" >
          <Field
            placeholder="Nenhum diretório selecionado"
            value={draftPath()}
            onInput={setDraftPath}
            onBlur={() => props.onPathBlur(draftPath())}
          />
        </div>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto mt-3 -mx-4 px-4">
        <Show
          when={props.files.length > 0}
          fallback={
            <div class="h-full flex items-center justify-center text-sm text-gray-400">
              Selecione um diretório para ver os arquivos JSON
            </div>
          }
        >
          {/* All the actual <table>/<tr>/<td> markup below is ours — the
              table library only computed the header/row/cell *data*
              (fileTable.getHeaderGroups()/getRowModel()); `<filesTable.FlexRender>`
              is what turns each header/cell's config (the `header:`/`cell:`
              you defined above in fileColumns) into real JSX. */}
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="sticky top-0 bg-white">
                <For each={filesTable.getHeaderGroups()}>
                  {(headerGroup) => (
                    <tr class="border-b border-gray-200">
                      <For each={headerGroup.headers}>
                        {(header) => (
                          <th class="py-1.5 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                            <filesTable.FlexRender header={header} />
                          </th>
                        )}
                      </For>
                    </tr>
                  )}
                </For>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <For each={filesTable.getRowModel().rows}>
                  {(row) => (
                    <tr class="hover:bg-gray-50/60 transition-colors">
                      <For each={row.getAllCells()}>
                        {(cell) => (
                          <td class="py-1.5 pr-3">
                            <filesTable.FlexRender cell={cell} />
                          </td>
                        )}
                      </For>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </Show>
      </div>

      <div class="mt-3 pt-3 border-t border-gray-100 flex justify-end shrink-0">
        <button
          type="button"
          onClick={props.onImport}
          disabled={props.isImporting || props.files.length === 0}
          class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Show
            when={!props.isImporting}
            fallback={<FaSolidSpinner size={13} class="animate-spin" />}
          >
            <FaSolidPlay size={11} />
          </Show>
          {props.isImporting ? "Importando..." : "Importar"}
        </button>
      </div>
    </div>
  );
}

export default DirSelector;
