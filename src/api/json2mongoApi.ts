// READ ME FIRST (file 2/8). This is the entire contract between the
// frontend and Rust for this screen: every `invoke(...)` call the app makes
// lives here and nowhere else. `invoke<T>("command_name", args)` is Tauri's
// RPC call — it serializes `args` to JSON, calls the matching
// `#[tauri::command]` fn in Rust (see mongo.rs, 3/8), and resolves with
// whatever that fn returns (or rejects with its `Err`). The generic `<T>` is
// just a TypeScript annotation for what shape to expect back — Tauri doesn't
// validate it, so it has to match the Rust return type by hand.
//
// Next: src-tauri/src/commands/mongo.rs (3/8) to see these implemented.
import { invoke } from "@tauri-apps/api/core";

export interface DirectorySelection {
  path: string;
  files: string[];
}

export interface MongoConnectionConfig {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
  uri: string;
}

export interface ImportFileSpec {
  filename: string;
  collection: string;
  index: number;
}

export const json2mongoApi = {
  testMongoConnection: (uri: string) =>
    invoke<string>("test_mongo_connection", { uri }),

  selectJsonDirectory: () =>
    invoke<DirectorySelection>("select_json_directory"),

  validateJsonDirectory: (path: string) =>
    invoke<DirectorySelection>("validate_json_directory", { path }),

  importJsonFiles: (path: string, config: MongoConnectionConfig, files: ImportFileSpec[]) =>
    invoke<void>("import_json_files", { path, config, files }),
};
