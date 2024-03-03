use std::path::Display;

use aes_gcm::aead::Aead;
use serde::Deserialize;
use sha2::digest::generic_array::GenericArray;
use tauri::{AppHandle, State};

use crate::{
  entity::ProfileEntity,
  errors::{BackendError, FieldError},
  infrastructures::{cipher::create_cipher, database::open_db, hashing::hash},
  services::authenticate_profile,
  states::ProfileState,
};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SelectProfileDTO {
  profile_name: String,
  security_code: Option<String>,
}

#[tauri::command]
pub async fn select_profile(
  app_handle: AppHandle,
  profile_state: State<'_, ProfileState>,
  selected_profile: SelectProfileDTO,
) -> Result<(), BackendError> {
  let db = open_db(app_handle)?;

  let profile_tree = db.open_tree("profile")?;

  match profile_tree.get(selected_profile.profile_name)? {
    None => Err(BackendError::critical(
      "The profile is not found",
      None::<Display>,
    )),
    Some(record) => {
      let profile: ProfileEntity = bincode::deserialize(&record)?;

      let pat: String = match profile.security_code {
        Some(code) => {
          let wrong_security_code_error =
            BackendError::Form(vec![FieldError::new("securityCode", "Wrong security code")]);

          match selected_profile.security_code {
            Some(security_code) => {
              let hashed = hash(&security_code);

              if hashed.len() != code.len()
                || code.iter().zip(&hashed).filter(|&(a, b)| a == b).count() != code.len()
              {
                return Err(wrong_security_code_error);
              }

              let (nonce, cipher) =
                create_cipher(&security_code, &profile.email, &profile.profile_name);
              let pat_bytes = cipher.decrypt(
                GenericArray::from_slice(&nonce),
                profile.personal_access_token.as_ref(),
              )?;

              Ok(String::from_utf8_lossy(&pat_bytes).into())
            }
            None => Err(wrong_security_code_error),
          }
        }
        None => Ok(String::from_utf8_lossy(&profile.personal_access_token).into()),
      }?;

      match authenticate_profile(&profile.email, &pat).await? {
        Some(data) => {
          profile_state.update(profile.email, pat, data.account_id)?;

          Ok(())
        }
        None => Err(BackendError::unauthorized()),
      }
    }
  }
}
