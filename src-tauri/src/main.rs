// @author: Tinatsei Chingaya (Zedfoura), Antigravity
// @description: Tauri 2.0 Desktop Wrapper Main Entry Point for Fintasy Stock Royale

mod steam;

use std::sync::Mutex;
use steam::{SteamBridge, SteamStatusResponse};
use tauri::State;

struct AppState {
    steam: Mutex<SteamBridge>,
}

#[tauri::command]
fn get_steam_status(state: State<AppState>) -> SteamStatusResponse {
    let mut bridge = state.steam.lock().unwrap();
    bridge.init()
}

#[tauri::command]
fn unlock_achievement(state: State<AppState>, achievement_id: String) -> Result<bool, String> {
    let bridge = state.steam.lock().unwrap();
    bridge.unlock_achievement(&achievement_id)
}

#[tauri::command]
fn set_rich_presence(state: State<AppState>, status: String) -> Result<bool, String> {
    let bridge = state.steam.lock().unwrap();
    bridge.set_rich_presence(&status)
}

fn main() {
    let state = AppState {
        steam: Mutex::new(SteamBridge::new()),
    };

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            get_steam_status,
            unlock_achievement,
            set_rich_presence
        ])
        .run(tauri::generate_context!())
        .expect("error while running Fintasy: Stock Royale desktop application");
}
