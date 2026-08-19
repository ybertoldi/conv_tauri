// READ ME FIRST (file 4/8). This is the densest file in the feature —
// take it slow. It owns the connection form's state end to end:
//   - the 6 fields (url + host/port/user/password/database) via TanStack Form
//   - keeping the `url` field and the 5 discrete fields mirroring each other
//     as you type into either side
//   - persisting the whole form to localStorage so it survives app restarts
//   - the "test connection" network call (via json2mongoApi, file 2/8)
//
// The one non-obvious mechanic worth understanding before reading on:
// `createForm` (TanStack Form's Solid adapter) does NOT store field values
// in a Solid signal. It uses a separate library, @tanstack/store, with its
// own pub/sub system. That means `form.state.values.host` is a plain
// property read on a plain object — calling it inside a Solid `createEffect`
// creates NO dependency, so that effect would only ever run once, at setup,
// and never again no matter how much you type. That's why the sync logic
// below uses `form.store.subscribe(...)` instead of `createEffect` — it's
// TanStack Store's own subscription mechanism, the one thing that actually
// fires on every field change. (Individual `<form.Field name="host">`
// bindings you'll see in MongoForm.tsx, 5/8, don't hit this problem because
// they go through TanStack Form's own Solid bridge internally.)
//
// Next: components/MongoForm.tsx (5/8), which renders the `form` this file
// returns.
import { createForm } from "@tanstack/solid-form";
import { createMutation } from "@tanstack/solid-query";
import { json2mongoApi } from "../../api/json2mongoApi";

export interface ConnectionFormValues {
  url: string;
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
}

export const DEFAULT_CONNECTION_VALUES: ConnectionFormValues = {
  url: "mongodb://localhost:27017",
  host: "localhost",
  port: "27017",
  user: "",
  password: "",
  database: "",
};

// Assembles the 5 discrete fields into a single connection string, e.g.
// `mongodb://user:pass@localhost:27017/mydb`. encodeURIComponent on
// user/password matters: a password containing `@` or `:` would otherwise
// be read as one of the URL's own delimiters instead of a literal character
// — see parseMongoUri's decodeURIComponent below for the inverse.
export function buildUri(values: ConnectionFormValues) {
  if (values.url.trim()) return values.url.trim();
  const auth = values.user
    ? `${encodeURIComponent(values.user)}${values.password ? ":" + encodeURIComponent(values.password) : ""
    }@`
    : "";
  const db = values.database ? `/${values.database}` : "";
  return `mongodb://${auth}${values.host}:${values.port}${db}`;
}

// Inverse of buildUri. Returns null when the URI has anything the 5 fields
// can't represent (query params, mongodb+srv, multiple hosts) — in that
// case we leave the URL field alone rather than silently losing data.
// `new URL(...)` parses any `scheme://...` string, not just http(s) —
// that's what makes reusing the built-in URL parser for mongodb:// work at
// all, no mongo-specific parsing library needed.
export function parseMongoUri(uri: string) {
  const trimmed = uri.trim();
  if (!trimmed.startsWith("mongodb://")) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.search || parsed.hash || parsed.hostname.includes(",")) return null;
    return {
      host: parsed.hostname,
      port: parsed.port || "27017",
      // `URL`'s username/password getters return the percent-encoded form
      // (what buildUri wrote with encodeURIComponent above) — decode here
      // or a password like "p@ss" would come back as the literal text
      // "p%40ss" in the field.
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ""),
    };
  } catch {
    return null;
  }
}

function storageKeyFor(id: string) {
  return `mongoConnection:${id}`;
}

function loadStoredConnectionValues(id: string): ConnectionFormValues {
  try {
    const raw = localStorage.getItem(storageKeyFor(id));
    if (!raw) return DEFAULT_CONNECTION_VALUES;
    return { ...DEFAULT_CONNECTION_VALUES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONNECTION_VALUES;
  }
}

export function createConnectionForm(id: string) {
  const testConnection = createMutation(() => ({
    mutationFn: (values: ConnectionFormValues) => json2mongoApi.testMongoConnection(buildUri(values)),
  }));

  const form = createForm(() => ({
    defaultValues: loadStoredConnectionValues(id),
    onSubmit: async ({ value }) => testConnection.mutate(value),
  }));

  // Keeps the `url` field and the 5 discrete fields mirroring each other,
  // AND persists to localStorage — both need to run on every field change,
  // so one subscription does both jobs. `form.store.subscribe` (not
  // createEffect — see the file-header note on why) fires on ANY field
  // edit, so `prev` is how we tell WHICH side just changed: did `url`
  // change but nothing else (user typed/pasted into the url box), or did
  // one of the other 5 change (user typed into host/port/etc)?
  //
  // The loop-prevention trick: after reacting, we reassign `prev` from
  // `form.state.values` AGAIN, *after* any `setFieldValue` calls below have
  // already run (they're synchronous). So by the time this subscriber
  // returns, `prev` already equals the new state. `setFieldValue` triggers
  // another run of this same subscriber (because it changed the store) —
  // but on that next run, values vs. prev diff to nothing, so it's a no-op.
  // Without that re-sync at the end, `prev` would lag one step behind,
  // and each side would keep re-triggering the other forever.
  let prev = { ...form.state.values };
  form.store.subscribe(() => {
    const values = { ...form.state.values };
    const urlChanged = values.url !== prev.url;
    const partsChanged =
      values.host !== prev.host ||
      values.port !== prev.port ||
      values.user !== prev.user ||
      values.password !== prev.password ||
      values.database !== prev.database;

    if (urlChanged && !partsChanged) {
      const parsed = parseMongoUri(values.url);
      if (parsed) {
        form.setFieldValue("host", parsed.host);
        form.setFieldValue("port", parsed.port);
        form.setFieldValue("user", parsed.user);
        form.setFieldValue("password", parsed.password);
        form.setFieldValue("database", parsed.database);
      }
    } else if (partsChanged) {
      // `{ ...values, url: "" }` forces buildUri to rebuild from the parts
      // instead of taking its own early-return shortcut (buildUri returns
      // `values.url` verbatim if it's non-empty — which it usually is here,
      // since we're mid-typing into one of the *other* fields).
      form.setFieldValue("url", buildUri({ ...values, url: "" }));
    }

    localStorage.setItem(storageKeyFor(id), JSON.stringify(form.state.values));
    prev = { ...form.state.values };
  });

  return { form, testConnection };
}

// `["form"]` picks just the `form` half of createConnectionForm's return
// type, so components that only need to render fields (MongoForm.tsx, 5/8)
// don't also have to know about `testConnection` in their prop types.

export type ConnectionFormApi = ReturnType<typeof createConnectionForm>["form"];
