use std::{fs::create_dir_all, path::Display};

use tauri::AppHandle;

use crate::errors::BackendError;

const DATABASE_FOLDER: &str = "database";

pub fn open_db(app_handle: AppHandle) -> Result<sled::Db, BackendError> {
  let data_dir = app_handle.path_resolver().app_data_dir();

  match data_dir {
    Some(path) => {
      let db_path = path.join(DATABASE_FOLDER);

      if let Err(e) = create_dir_all(&db_path) {
        return Err(BackendError::critical("Can not prepare database", Some(e)));
      }

      let db = sled::open(db_path)?;

      Ok(db)
    }
    None => Err(BackendError::critical(
      "The app data path is not found",
      None::<Display>, // bypass the generic rule
    )),
  }
}
