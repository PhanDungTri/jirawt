use serde::Serialize;
use tauri::AppHandle;

use crate::{entity::ProfileEntity, errors::BackendError, infrastructures::database::open_db};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProfileDTO {
  id: String,
  profile_name: String,
  is_protected: bool,
}

#[tauri::command]
pub async fn get_profiles(app_handle: AppHandle) -> Result<Vec<ProfileDTO>, BackendError> {
  let db = open_db(app_handle)?;
  let profile_tree = db.open_tree("profile")?;
  let mut profiles = Vec::<ProfileDTO>::new();

  for profile_record in profile_tree.iter() {
    let (_, bytes) = profile_record?;
    let profile: ProfileEntity = bincode::deserialize(&bytes)?;
    let is_protected = profile.security_code.is_some();

    profiles.push(ProfileDTO {
      id: profile.id,
      profile_name: profile.profile_name,
      is_protected,
    });
  }

  Ok(profiles)
}
