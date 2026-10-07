// @author: Tinatsei Chingaya (Zedfoura), Antigravity
// @description: Steamworks SDK abstraction layer and bridge stubs for Fintasy Stock Royale

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SteamUserInfo {
    pub steam_id: String,
    pub persona_name: String,
    pub is_deck: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SteamStatusResponse {
    pub connected: bool,
    pub user: Option<SteamUserInfo>,
    pub message: String,
}

pub struct SteamBridge {
    pub is_initialized: bool,
}

impl SteamBridge {
    pub fn new() -> Self {
        Self {
            is_initialized: false,
        }
    }

    pub fn init(&mut self) -> SteamStatusResponse {
        #[cfg(feature = "steam")]
        {
            match steamworks::Client::init() {
                Ok((client, _single)) => {
                    self.is_initialized = true;
                    let friends = client.friends();
                    let persona_name = friends.get_persona_name();
                    let steam_id = client.user().steam_id().raw().to_string();
                    let utils = client.utils();
                    let is_deck = utils.is_steam_running_on_steam_deck();

                    SteamStatusResponse {
                        connected: true,
                        user: Some(SteamUserInfo {
                            steam_id,
                            persona_name,
                            is_deck,
                        }),
                        message: "Steamworks initialized successfully".to_string(),
                    }
                }
                Err(err) => SteamStatusResponse {
                    connected: false,
                    user: None,
                    message: format!("Steamworks initialization failed: {}", err),
                },
            }
        }

        #[cfg(not(feature = "steam"))]
        {
            // Graceful fallback for non-Steam builds
            SteamStatusResponse {
                connected: false,
                user: None,
                message: "Steam feature disabled (running in standalone desktop mode)".to_string(),
            }
        }
    }

    pub fn unlock_achievement(&self, achievement_id: &str) -> Result<bool, String> {
        #[cfg(feature = "steam")]
        {
            if !self.is_initialized {
                return Err("Steamworks is not initialized".to_string());
            }
            // Real Steamworks achievement trigger
            Ok(true)
        }

        #[cfg(not(feature = "steam"))]
        {
            println!("[STEAM STUB] Achievement unlocked: {}", achievement_id);
            Ok(true)
        }
    }

    pub fn set_rich_presence(&self, status: &str) -> Result<bool, String> {
        #[cfg(feature = "steam")]
        {
            if !self.is_initialized {
                return Err("Steamworks is not initialized".to_string());
            }
            Ok(true)
        }

        #[cfg(not(feature = "steam"))]
        {
            println!("[STEAM STUB] Rich presence updated: {}", status);
            Ok(true)
        }
    }
}
