use mongodb::Client;
use std::{fmt::format, fs, sync::Mutex, time::Duration};
use tauri::{Emitter, State};
use tauri_plugin_dialog::DialogExt;
use tokio::time::sleep;

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

#[derive(serde::Serialize)]
pub struct DirectorySelection {
    pub path: String,
    pub files: Vec<String>,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct MongoConnectionConfig {
    host: String,
    port: String,
    user: String,
    password: String,
    database: String,
    uri: String,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ImportFileSpec {
    filename: String,
    collection: String,
    index: usize,
}

#[derive(serde::Serialize, Clone)]
pub struct ImportProgress {
    pub index: usize,
    pub output: Option<String>,
    pub status: ImportStatus,
}

impl ImportProgress {
    pub fn running(index: usize, output: String) -> ImportProgress {
        ImportProgress {
            index,
            output: Some(output),
            status: ImportStatus::Running,
        }
    }

    pub fn err(index: usize, output: String) -> ImportProgress {
        ImportProgress {
            index,
            output: Some(output),
            status: ImportStatus::Error,
        }
    }

    pub fn sucess(index: usize) -> ImportProgress {
        ImportProgress {
            index,
            output: None,
            status: ImportStatus::Success,
        }
    }
}

#[derive(serde::Serialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum ImportStatus {
    Pending,
    Running,
    Success,
    Error,
}

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

#[tauri::command]
pub async fn select_json_directory(
    open_dir: String,
    app: tauri::AppHandle,
) -> Result<DirectorySelection, String> {
    let dir = app
        .dialog()
        .file()
        .set_directory(open_dir)
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

#[tauri::command]
pub async fn import_json_files(
    path: String,
    config: MongoConnectionConfig,
    files: Vec<ImportFileSpec>,
    app: tauri::AppHandle,
) {
    for (i, f) in files.iter().enumerate() {
        app.emit(
            "import-progress",
            ImportProgress::running(f.index, format!("$ mongoimport {}: {}", f.filename, i)),
        )
        .unwrap();

        sleep(Duration::from_millis(2000)).await;

        app.emit("import-progress", ImportProgress::sucess(f.index))
            .unwrap();
    }
}

//////////////////////
// helper functions //
/////////////////////
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
