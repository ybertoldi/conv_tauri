// READ ME FIRST (file 1/8). This is the screen's entry point — the "map".
// It owns nothing itself: it just calls two hooks for state/logic and hands
// their pieces down to three dumb, render-only components as props. That
// split (hooks = state+logic, components = props in/JSX out) is the pattern
// the whole feature follows — see MEMORY-less version of this comment in
// each file for how that piece fits in.
//
// Where to go next: api/json2mongoApi.ts (2/8), then
// src-tauri/src/commands/mongo.rs (3/8) — those two together are the
// contract with Rust every hook below eventually calls into.
import { MongoForm } from "../../components/MongoForm";
import { DirSelector } from "../../components/DirSelector";
import { Terminal } from "../../components/Terminal";
import { createConnectionForm } from "./useConnectionForm";
import { createJsonImport } from "./useJsonImport";

export type { ConnectionFormValues, ConnectionFormApi } from "./useConnectionForm";

const Json2Mongo = () => {
  // Two independent hooks. `connectionForm` is the MongoDB connection form
  // (host/port/user/password/database/url) — see useConnectionForm.ts (4/8).
  // `jsonImport` is directory picking + the actual import run — see
  // useJsonImport.ts (6/8). jsonImport needs the connection's current values
  // only at import time, so it takes a *getter* (`() => connectionForm.state.values`)
  // instead of depending on the whole connectionForm hook — keeps the two
  // decoupled (jsonImport doesn't need to know how the connection form works).
  const { form: connectionForm, testConnection } = createConnectionForm("json2mongo");
  const jsonImport = createJsonImport(() => connectionForm.state.values);

  return (
    <div class="h-full overflow-y-auto">
      <div class="min-h-full sm:h-full sm:min-h-0 grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-[minmax(0,auto)_minmax(0,1fr)] gap-3">
        <div class="h-[280px] sm:h-auto sm:col-start-1 sm:row-start-1 sm:min-h-0">
          <MongoForm
            form={connectionForm}
            isTesting={testConnection.isPending}
            isSuccess={testConnection.isSuccess}
            isError={testConnection.isError}
            errorMessage={String(testConnection.error)}
          />
        </div>

        <div class="h-[280px] sm:h-auto sm:col-start-2 sm:row-start-1 sm:row-span-2 sm:min-h-0">
          <DirSelector
            selectedPath={jsonImport.selectedPath()}
            files={jsonImport.files()}
            isImporting={jsonImport.runImport.isPending}
            onSelectDirectory={() => jsonImport.selectDirectory.mutate()}
            onPathBlur={jsonImport.onPathBlur}
            onUpdateCollectionName={jsonImport.updateCollectionName}
            onImport={jsonImport.start}
          />
        </div>

        <div class="h-[280px] sm:h-auto sm:col-start-1 sm:row-start-2 sm:min-h-0">
          <Terminal logs={Array(50).fill(["$ teste", "opa"]).flat() /*jsonImport.consoleLogs()*/} />
        </div>
      </div>
    </div>
  );
};

export default Json2Mongo;
