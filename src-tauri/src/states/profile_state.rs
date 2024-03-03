use std::sync::Mutex;

use crate::errors::BackendError;

pub struct ProfileStateData {
  pub email: String,
  pub personal_access_token: String,
  pub account_id: String,
}

pub struct ProfileState(pub Mutex<Option<ProfileStateData>>);

impl ProfileState {
  pub fn update(
    &self,
    email: String,
    personal_access_token: String,
    account_id: String,
  ) -> Result<(), BackendError> {
    let mut data = self.0.lock()?;
    *data = Some(ProfileStateData {
      email,
      personal_access_token,
      account_id,
    });

    Ok(())
  }

  pub fn get_credentials(&self) -> Result<(String, String), BackendError> {
    let state_data = self.0.lock()?;

    if let Some(data) = state_data.as_ref() {
      return Ok((data.email.clone(), data.personal_access_token.clone()));
    }

    Err(BackendError::unauthorized())
  }

  pub fn get_account_id(&self) -> Result<String, BackendError> {
    let state_data = self.0.lock()?;

    if let Some(data) = state_data.as_ref() {
      return Ok(data.account_id.clone());
    }

    Err(BackendError::unauthorized())
  }
}
