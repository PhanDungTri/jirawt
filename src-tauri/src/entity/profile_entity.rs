use aes_gcm::aead::Aead;
use nanoid::nanoid;
use serde::{Deserialize, Serialize};
use sha2::digest::generic_array::GenericArray;

use crate::{
  dtos::{AddProfileDTO, MyselfDTO},
  errors::BackendError,
  infrastructures::{cipher::create_cipher, hashing::hash},
};

#[derive(Serialize, Deserialize)]
pub struct ProfileEntity {
  pub id: String,
  pub account_id: String,
  pub display_name: String,
  pub profile_name: String,
  pub email: String,
  pub personal_access_token: Vec<u8>,
  pub security_code: Option<Vec<u8>>,
}

impl ProfileEntity {
  pub fn generate_from_dtos(
    profile: AddProfileDTO,
    myself: MyselfDTO,
  ) -> Result<Self, BackendError> {
    let AddProfileDTO {
      profile_name,
      email,
      personal_access_token,
      security_code,
    } = profile;
    let MyselfDTO {
      account_id,
      display_name,
    } = myself;
    let id = nanoid!(8);

    match security_code {
      None => Ok(Self {
        id,
        account_id,
        display_name,
        profile_name,
        email,
        personal_access_token: personal_access_token.as_bytes().to_vec(),
        security_code: None,
      }),
      Some(code) => {
        let (nonce, cipher) = create_cipher(&code, &email, &profile_name);

        let cipher_text = cipher.encrypt(
          GenericArray::from_slice(&nonce),
          personal_access_token.as_bytes(),
        )?;

        let hashed_code = hash(&code);

        Ok(Self {
          id,
          account_id,
          display_name,
          profile_name,
          email,
          personal_access_token: cipher_text,
          security_code: Some(hashed_code),
        })
      }
    }
  }
}
