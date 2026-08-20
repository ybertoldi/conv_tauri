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

#[derive(serde::Serialize, serde::Deserialize, Clone)]
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
    pub fn new(index: usize, output: Option<String>, status: ImportStatus) -> Self {
        Self {
            index,
            output,
            status,
        }
    }

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

pub struct Logger<'a> {
    app: &'a tauri::AppHandle,
    file: Option<ImportFileSpec>,
    status: ImportStatus,
}

impl<'a> Logger<'a> {
    pub fn new(app: &'a tauri::AppHandle) -> Self {
        Self {
            app,
            file: None,
            status: ImportStatus::Pending,
        }
    }

    pub fn start(&mut self, file: &ImportFileSpec) {
        self.file = Some(file.clone());
        self.status = ImportStatus::Running;
        self.update_status();
    }

    pub fn error(&mut self) {
        self.status = ImportStatus::Error;
        self.update_status();
    }

    pub fn end_sucess(&mut self) {
        self.status = ImportStatus::Success;
        self.update_status();

        self.status = ImportStatus::Pending;
        self.file = None;
    }

    pub fn log(&self, msg: &str) {
        if let Some(file) = &self.file {
            self.app.emit(
                "import-progress",
                ImportProgress::new(file.index, Some(String::from(msg)), self.status.clone()),
            );
        }
    }

    fn update_status(&self) {
        if let Some(f) = &self.file {
            self.app
                .emit(
                    "import-progress",
                    ImportProgress::new(f.index, None, self.status.clone()),
                )
                .unwrap();
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
    let mut logger = Logger::new(&app);
    for (i, f) in files.iter().enumerate() {
        logger.start(f);
        logger.log("Hello My darling...");
        sleep(Duration::from_millis(2000)).await;
        logger.log("Howdy");
        logger.end_sucess();
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
