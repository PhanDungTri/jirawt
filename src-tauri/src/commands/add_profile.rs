use tauri::AppHandle;

use crate::{
  dtos::AddProfileDTO,
  entity::ProfileEntity,
  errors::{BackendError, FieldError},
  infrastructures::database::open_db,
  services::authenticate_profile,
};

#[tauri::command]
pub async fn add_profile(
  app_handle: AppHandle,
  profile: AddProfileDTO,
) -> Result<(), BackendError> {
  let db = open_db(app_handle)?;
  let profile_tree = db.open_tree("profile")?;
  let mut form_error = Vec::<FieldError>::new();

  if profile_tree.get(&profile.profile_name)?.is_some() {
    form_error.push(FieldError::new(
      "profileName",
      "The profile name has already existed",
    ));
  }

  match authenticate_profile(&profile.email, &profile.personal_access_token).await? {
    Some(data) => {
      if !form_error.is_empty() {
        return Err(BackendError::Form(form_error));
      }

      let profile_entity = ProfileEntity::generate_from_dtos(profile, data)?;
      let profile_key = profile_entity.profile_name.as_bytes();
      let profile_value = bincode::serialize(&profile_entity)?;

      profile_tree.insert(profile_key, profile_value)?;

      Ok(())
    }
    None => {
      form_error.push(FieldError::new("email", "Wrong email"));
      form_error.push(FieldError::new("personalAccessToken", "Or wrong password"));

      Err(BackendError::Form(form_error))
    }
  }
}
