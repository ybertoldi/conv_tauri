import { MongoForm } from "../../components/MongoForm";
import { DirSelector } from "../../components/DirSelector";
import { Terminal } from "../../components/Terminal";
import { createConnectionForm } from "./useConnectionForm";
import { createJsonImport } from "./useJsonImport";

export type { ConnectionFormValues, ConnectionFormApi } from "./useConnectionForm";

const Json2Mongo = () => {
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
            onPushCheckbox={jsonImport.toggleCheck}
            onImport={jsonImport.start}
          />
        </div>

        <div class="h-[280px] sm:h-auto sm:col-start-1 sm:row-start-2 sm:min-h-0">
          <Terminal logs={jsonImport.consoleLogs()} />
        </div>
      </div>
    </div>
  );
};

export default Json2Mongo;
