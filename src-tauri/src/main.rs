// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod constants;
mod dtos;
mod entity;
mod errors;
mod infrastructures;
mod services;
mod states;
mod utils;

use std::sync::Mutex;

use states::ProfileState;

use crate::commands::{
  add_profile, fetch_boards, fetch_sprints, fetch_worklogs, get_profiles, select_profile,
};

fn main() {
  tauri::Builder::default()
    .manage(ProfileState(Mutex::new(None)))
    .invoke_handler(tauri::generate_handler![
      // fetch_my_self,
      select_profile,
      add_profile,
      fetch_boards,
      fetch_sprints,
      fetch_worklogs,
      get_profiles
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
