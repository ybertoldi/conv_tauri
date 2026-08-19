// READ ME FIRST (file 3/8). Rust side of the contract in
// api/json2mongoApi.ts (2/8) — every `#[tauri::command]` fn here matches an
// `invoke("...")` call there by name, and the arg struct fields (Rust,
// snake_case by convention but Tauri accepts the camelCase the frontend
// sends via serde's rename-all) must line up with what's passed in.
//
// `import_json_files` is the one command api/json2mongoApi.ts calls that
// does NOT exist here yet — that's the piece still to write. It should:
// read each file, insert its documents into `config.database`/the given
// collection using the `Client` stashed in Json2MongoState (see below), and
// emit an "import-progress" event per file (see useJsonImport.ts, 6/8, for
// the { index, output, status } shape the frontend listens for — use
// `app.emit("import-progress", payload)`, from the `tauri::Emitter` trait).
//
// Next: useConnectionForm.ts (4/8).
use mongodb::Client;
use std::{fs, sync::Mutex};
use tauri::State;
use tauri_plugin_dialog::DialogExt;

// Tauri app-wide state (registered via `.manage(...)` in lib.rs). A command
// gets access to it by taking `state: State<'_, Json2MongoState>` as a
// parameter — Tauri injects it, matched by type, not by name. Mutex because
// commands can run concurrently and the client needs interior mutability.
pub struct Json2MongoState {
    pub client: Mutex<Option<Client>>,
}

impl Default for Json2MongoState {
    fn default() -> Self {
        Json2MongoState {
            client: Mutex::new(None),
        }
    }
}

// `derive(Serialize)` is what lets Tauri turn this into the JSON object
// `DirectorySelection` (the TS interface) expects on the other side — field
// names have to match (Tauri/serde default to the same casing you write here).
#[derive(serde::Serialize)]
pub struct DirectorySelection {
    pub path: String,
    pub files: Vec<String>,
}

// `#[tauri::command]` is what makes a plain fn callable via invoke() —
// without it, this is just a normal Rust function Tauri doesn't know about.
// Returning `Result<T, String>` maps directly to invoke()'s promise
// resolving with `T` or rejecting with the `String` as the JS error.
//
// Note: `Client::with_uri_str` only parses the URI and prepares the driver —
// it doesn't actually verify the server is reachable (mongodb's connections
// are lazy). So this "succeeding" doesn't guarantee a real connection; the
// `Ok("teste".into())` is a placeholder return value, not real connection info.
#[tauri::command]
pub async fn test_mongo_connection(
    uri: String,
    state: State<'_, Json2MongoState>,
) -> Result<String, String> {
    let res = Client::with_uri_str(&uri)
        .await
        .map_err(|e| e.to_string())?;

    *state.client.lock().unwrap() = Some(res);

    Ok("teste".into())
}

fn list_json_files(path: &str) -> Result<DirectorySelection, String> {
    if !std::path::Path::new(path).is_dir() {
        return Err("Diretório inválido".into());
    }

    let files: Vec<String> = fs::read_dir(path)
        .map_err(|e| e.to_string())?
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.file_name().to_string_lossy().ends_with(".json"))
        .filter_map(|entry| entry.file_name().into_string().ok())
        .collect();

    Ok(DirectorySelection {
        files,
        path: path.to_string(),
    })
}

#[tauri::command]
pub async fn select_json_directory(openDir: String, app: tauri::AppHandle) -> Result<DirectorySelection, String> {
    let dir = app
        .dialog()
        .file()
        .add_filter("Pasta arquivos json", &["json"])
        .blocking_pick_folder()
        .iter()
        .next()
        .cloned();

    match dir {
        Some(p) => list_json_files(&p.to_string()),
        None => Err("Sem diretorio".into()),
    }
}

#[tauri::command]
pub fn validate_json_directory(path: String) -> Result<DirectorySelection, String> {
    list_json_files(&path)
}
