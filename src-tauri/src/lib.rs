mod commands;
use commands::mongo::{
    select_json_directory, test_mongo_connection, validate_json_directory, Json2MongoState,
};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(Json2MongoState::default())
        .invoke_handler(tauri::generate_handler![
            greet,
            test_mongo_connection,
            select_json_directory,
            validate_json_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
