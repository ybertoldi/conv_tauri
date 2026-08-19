import { createSignal } from "solid-js";
import { listen } from "@tauri-apps/api/event";
import { createMutation } from "@tanstack/solid-query";
import { json2mongoApi, type DirectorySelection } from "../../api/json2mongoApi";
import type { JsonFile } from "../../components/DirSelector";
import type { ConnectionFormValues } from "./useConnectionForm";

interface ImportProgress {
  index: number;
  output: string;
  status: JsonFile["status"];
}

// READ ME FIRST (file 6/8). Owns directory selection/validation and the
// import run itself. Three createMutation calls here are TanStack Query
// mutations (same family as the createMutation you saw for testConnection
// in useConnectionForm.ts, 4/8) — each wraps one async call (usually one
// json2mongoApi function) and gives you `.mutate()`, `.isPending`,
// `.isSuccess`/`.isError`, etc "for free" instead of hand-rolled loading
// signals.
//
// Needs the connection values (host/port/etc) only at the moment an import
// actually runs, so the caller passes a *getter* — `() =>
// connectionForm.state.values` from index.tsx (1/8) — instead of this hook
// depending on useConnectionForm.ts directly. That keeps this hook usable
// even if the connection form ever changes shape.
//
// Next: components/DirSelector.tsx (7/8), which renders everything this
// hook returns.
export function createJsonImport(getConnectionValues: () => ConnectionFormValues) {
  const [selectedPath, setSelectedPath] = createSignal("");
  const [files, setFiles] = createSignal<JsonFile[]>([]);
  const [consoleLogs, setConsoleLogs] = createSignal<string[]>([]);

  // Shared onSuccess for both selectDirectory (native folder dialog) and
  // validatePath (user typed/pasted a path and blurred the field) below —
  // both end up needing the exact same "seed the file table" logic, they
  // just get there via different Rust commands.
  const applyDirectory = (result: DirectorySelection) => {
    setSelectedPath(result.path);
    setFiles(
      result.files.map((name) => ({
        name,
        collectionName: name.replace(/\.json$/i, ""),
        status: "pending" as const,
      }))
    );
    setConsoleLogs([]);
  };

  const selectDirectory = createMutation(() => ({
    mutationFn: json2mongoApi.selectJsonDirectory(selectedPath()),
    onSuccess: applyDirectory,
  }));

  const validatePath = createMutation(() => ({
    mutationFn: json2mongoApi.validateJsonDirectory,
    onSuccess: applyDirectory,
  }));

  const onPathBlur = (path: string) => {
    if (path && path !== selectedPath()) validatePath.mutate(path);
  };

  const updateCollectionName = (index: number, value: string) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, collectionName: value } : f))
    );
  };

  const runImport = createMutation(() => ({
    mutationFn: async () => {
      const values = getConnectionValues();

      setConsoleLogs([]);
      setFiles((prev) => prev.map((f) => ({ ...f, status: "pending" as const })));

      // This is a second, DIFFERENT communication channel from invoke().
      // invoke() is request/response — one call, one reply. `listen(...)`
      // subscribes to Tauri *events*, which Rust can `app.emit(...)` any
      // number of times over the life of one long-running command — exactly
      // what's needed here, since importing N files should report progress
      // N times (one per file), not just once at the very end. `unlisten()`
      // is important: without calling it, this closure (and its captured
      // `setFiles`/`setConsoleLogs`) would keep listening forever, firing on
      // every future import run too, not just this one.
      const unlisten = await listen<ImportProgress>("import-progress", (event) => {
        const { index, output, status } = event.payload;
        setConsoleLogs((prev) => [...prev, output]);
        setFiles((prev) =>
          prev.map((f, i) => (i === index ? { ...f, status } : f))
        );
      });

      try {
        await json2mongoApi.importJsonFiles(
          selectedPath(),
          {
            host: values.host,
            port: values.port,
            user: values.user,
            password: values.password,
            database: values.database,
            uri: values.url.trim(),
          },
          files().map((f, index) => ({
            filename: f.name,
            collection: f.collectionName,
            index,
          }))
        );
      } catch (err) {
        setConsoleLogs((prev) => [...prev, `Error: ${err}`]);
        throw err;
      } finally {
        unlisten();
      }
    },
  }));

  const start = () => {
    if (files().length === 0 || !selectedPath()) return;
    runImport.mutate();
  };

  return {
    selectedPath,
    files,
    consoleLogs,
    selectDirectory,
    onPathBlur,
    updateCollectionName,
    runImport,
    start,
  };
}

export type JsonImport = ReturnType<typeof createJsonImport>;
