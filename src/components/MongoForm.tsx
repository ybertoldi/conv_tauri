import { createMemo, createSignal, For, Show } from "solid-js";
import { Combobox as ArkCombobox, createListCollection } from "@ark-ui/solid/combobox";
import {
  FaSolidChevronDown,
  FaSolidCircleCheck,
  FaSolidCircleXmark,
  FaSolidPlug,
  FaSolidPlus,
  FaSolidServer,
  FaSolidSpinner,
} from "solid-icons/fa";
import { PanelHeader } from "./PanelHeader";
import type { ConnectionFormApi } from "../screens/Json2Mongo/useConnectionForm";
import Field from "./Field";

// READ ME FIRST (file 5/8). Pure UI: renders the `form` returned by
// useConnectionForm.ts (4/8) via TanStack Form's `<props.form.Field name="...">`
// render-prop pattern — you'll see this shape repeated for every field:
//
//   <props.form.Field name="host">
//     {(field) => <input value={field().state.value} onInput={...} />}
//   </props.form.Field>
//
// `field()` is a Solid accessor (note the call) that subscribes this one
// input to just that one field's state — that's TanStack Form's own
// Solid bridge, the thing the file-4 header comment mentioned as the
// reactive path that DOES work, unlike raw `form.state.values` reads.
//
// The `database` field uses the `Combobox` below instead of a plain
// `<input>` — it's a searchable dropdown built on Ark UI (a headless
// component library: it ships behavior/accessibility/positioning with
// zero built-in styling, so every visual class here is ours).
const COMMON_DATABASES = ["admin", "local", "config", "test"];

// Ark UI's Combobox is a *compound component*: instead of one <Combobox />
// tag with a pile of props, related pieces are exposed as
// Combobox.Root/.Control/.Input/.Trigger/.Positioner/.Content/.Item/etc,
// each rendering one real DOM element, sharing state through context. Root
// owns the state machine; every other part just reads/writes into it. This
// is a common pattern for headless UI libraries (also used by Radix, Kobalte,
// Zag.js itself) — once you recognize the shape here you'll recognize it
// in other libraries too.
//
// It owns keyboard nav, outside-click, and floating positioning internally
// — the old hand-rolled version's `open`/`highlighted` signals, manual
// `onKeyDown`, and `document.addEventListener("mousedown", ...)` are all
// gone because of this. We only still supply: filtering (`filtered`),
// styling (all the `class="..."` props), and the "add a custom database"
// button (`onAdd`/`canAdd`), since Ark has no opinion on any of those.
//
// Controlled the same way the old version was (value/onChange props), so
// it drops into a `<props.form.Field>` the same way a plain `<input>` does.
function Combobox(props: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  onAdd?: (value: string) => void;
  disabled?: boolean;
}) {
  const filtered = createMemo(() => {
    const q = props.value.trim().toLowerCase();
    if (!q) return props.options;
    return props.options.filter((opt) => opt.toLowerCase().includes(q));
  });

  // Ark's collection isn't a plain array — createListCollection wraps it
  // with the two lookup functions Combobox.Item needs internally
  // (itemToValue for identity/selection, itemToString for display + its
  // own built-in accessibility labeling). Since our items are just plain
  // strings, both are the identity function.
  const collection = createMemo(() =>
    createListCollection({
      items: filtered(),
      itemToValue: (item: string) => item,
      itemToString: (item: string) => item,
    })
  );

  const canAdd = () =>
    !props.disabled &&
    props.value.trim().length > 0 &&
    !props.options.includes(props.value.trim());

  return (
    // Two controlled pairs doing two different jobs, both wired to the same
    // props.value/onChange because this field is really just "one string",
    // not a true multi-select: `value`/`onValueChange` fire when an item is
    // *selected* (click/Enter on a list item); `inputValue`/`onInputValueChange`
    // fire on every *keystroke*. `allowCustomValue` is what stops Ark from
    // reverting the input back to the last real selection on blur if what
    // you typed doesn't match any collection item — without it, typing a
    // brand-new database name would just get erased.
    <ArkCombobox.Root
      collection={collection()}
      value={props.value ? [props.value] : []}
      onValueChange={(details) => props.onChange(details.value[0] ?? "")}
      inputValue={props.value}
      onInputValueChange={(details) => props.onChange(details.inputValue)}
      allowCustomValue
      openOnClick
      disabled={props.disabled}
      // Makes Ark set a `--reference-width` CSS var on the dropdown equal
      // to the input's width — used below via `w-[var(--reference-width)]`
      // so the dropdown matches the input instead of sizing to its longest item.
      positioning={{ sameWidth: true }}
    >
      <ArkCombobox.Label class="block text-xs font-medium text-gray-700 mb-0.5">
        {props.label}
      </ArkCombobox.Label>
      <div class="flex gap-2">
        <ArkCombobox.Control class="relative flex-1 min-w-0">
          <ArkCombobox.Input
            onBlur={() => props.onBlur?.()}
            class="block w-full rounded-lg border-0 bg-gray-50 pl-2.5 pr-7 py-1 text-sm text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-shadow appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <ArkCombobox.Trigger
            type="button"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <FaSolidChevronDown size={10} />
          </ArkCombobox.Trigger>
        </ArkCombobox.Control>
        <Show when={props.onAdd}>
          <button
            type="button"
            title="Adicionar database"
            disabled={!canAdd()}
            onClick={() => props.onAdd?.(props.value.trim())}
            class="inline-flex items-center justify-center w-7 rounded-lg bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <FaSolidPlus size={11} />
          </button>
        </Show>
      </div>
      {/* Positioner is the floating-ui-powered wrapper that actually places
          the dropdown relative to Control (flip/shift to stay on-screen,
          the width-matching above, etc). Content is the dropdown panel
          itself; it only renders while open, no manual Show needed. */}
      <ArkCombobox.Positioner>
        <ArkCombobox.Content class="z-10 w-[var(--reference-width)] max-h-48 overflow-y-auto rounded-lg bg-white shadow-lg ring-1 ring-gray-200 py-1 text-sm">
          <ArkCombobox.Empty class="px-2.5 py-1 text-gray-400">
            Nenhum resultado
          </ArkCombobox.Empty>
          {/* data-[highlighted] below is a Tailwind data-attribute variant:
              Ark stamps data-highlighted on whichever item is currently
              keyboard/pointer-highlighted, and Tailwind's data-[...] syntax
              lets us style straight off that without any JS of our own —
              this is what replaced the old version's `highlighted` signal. */}
          <For each={filtered()}>
            {(item) => (
              <ArkCombobox.Item
                item={item}
                class="px-2.5 py-1 cursor-pointer text-gray-700 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700"
              >
                <ArkCombobox.ItemText>{item}</ArkCombobox.ItemText>
              </ArkCombobox.Item>
            )}
          </For>
        </ArkCombobox.Content>
      </ArkCombobox.Positioner>
    </ArkCombobox.Root>
  );
}

export function MongoForm(props: {
  form: ConnectionFormApi;
  isTesting: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage: string;
}) {
  const [customDatabases, setCustomDatabases] = createSignal<string[]>([]);
  const databaseOptions = createMemo(() => [
    ...COMMON_DATABASES,
    ...customDatabases(),
  ]);


  const addDatabase = (name: string) => {
    if (!name || COMMON_DATABASES.includes(name) || customDatabases().includes(name)) return;
    setCustomDatabases((prev) => [...prev, name]);
  };

  return (
    <div class="h-full bg-white border border-gray-200 rounded-xl shadow-sm p-3 flex flex-col">
      <PanelHeader title="Conexão MongoDB" icon={FaSolidServer} />

      <form
        class="grid grid-cols-1 sm:grid-cols-2 content-start gap-x-3 gap-y-2 flex-1 min-h-0 overflow-y-auto pr-1 -mr-1"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          props.form.handleSubmit();
        }}
      >
        <div class="sm:col-span-2">
          <props.form.Field name="url">
            {(field) => (
              <>
                <label class="block text-xs font-medium text-gray-700 mb-0.5">
                  URL de conexão
                </label>
                <div class="flex gap-2">
                  <input
                    type="text"
                    value={field().state.value}
                    onInput={(e) => field().handleChange(e.currentTarget.value)}
                    onBlur={field().handleBlur}
                    placeholder="mongodb://usuario:senha@host:porta/database"
                    class="block w-full min-w-0 rounded-lg border-0 bg-gray-50 px-2.5 py-1 text-sm text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-shadow"
                  />
                  <button
                    type="submit"
                    disabled={props.isTesting}
                    class="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                  >
                    <Show
                      when={!props.isTesting}
                      fallback={<FaSolidSpinner size={13} class="animate-spin" />}
                    >
                      <FaSolidPlug size={13} />
                    </Show>
                    Conectar
                  </button>
                </div>
              </>
            )}
          </props.form.Field>

          <Show when={props.isSuccess}>
            <p class="mt-1 text-xs text-emerald-600 flex items-center gap-1">
              <FaSolidCircleCheck size={11} /> Conectado com sucesso
            </p>
          </Show>

          <Show when={props.isError}>
            <p class="mt-1 text-xs text-red-600 flex items-center gap-1.5">
              <FaSolidCircleXmark size={11} class="shrink-0" />
              <span class="truncate">{props.errorMessage}</span>
            </p>
          </Show>
        </div>

        <props.form.Field name="host">
          {(field) => (
            <Field
              label="Host"
              value={field().state.value}
              onInput={field().handleChange}
              onBlur={field().handleBlur}
            />
          )}
        </props.form.Field>

        <props.form.Field name="port">
          {(field) => (
            <Field
              label="Porta"
              value={field().state.value}
              onInput={field().handleChange}
              onBlur={field().handleBlur}
            />
          )}
        </props.form.Field>

        <props.form.Field name="user">
          {(field) => (
            <Field
              label="Usuário"
              value={field().state.value}
              onInput={field().handleChange}
              onBlur={field().handleBlur}
            />
          )}
        </props.form.Field>

        <props.form.Field name="password">
          {(field) => (
            <Field
              label="Senha"
              value={field().state.value}
              onInput={field().handleChange}
              onBlur={field().handleBlur}
            />
          )}
        </props.form.Field>

        <props.form.Field name="database">
          {(field) => (
            <Combobox
              label="Database"
              value={field().state.value}
              options={databaseOptions()}
              onChange={field().handleChange}
              onBlur={field().handleBlur}
              onAdd={addDatabase}
              disabled={!props.isSuccess}
            />
          )}
        </props.form.Field>

      </form>
    </div>
  );
}

export default MongoForm;
