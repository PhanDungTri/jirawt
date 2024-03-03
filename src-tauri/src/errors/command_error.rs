use std::{fmt::Display, string::FromUtf8Error, sync::PoisonError};

use serde::Serialize;

use super::FieldError;

#[derive(Serialize)]
#[serde(untagged)]
pub enum BackendError {
  Critical {
    message: String,
    #[serde(rename = "detailedInfo")]
    detailed_info: Option<String>,
  },
  Form(Vec<FieldError>),
  Unauthorized(String),
}

impl BackendError {
  pub fn critical<T: Display>(message: &str, detailed_info: Option<T>) -> BackendError {
    BackendError::Critical {
      message: message.into(),
      detailed_info: detailed_info.map(|e| e.to_string()),
    }
  }

  pub fn unauthorized() -> BackendError {
    BackendError::Unauthorized("Unauthorized".into())
  }
}

impl From<reqwest::Error> for BackendError {
  fn from(e: reqwest::Error) -> Self {
    if e.is_timeout() {
      return Self::critical(
        "It took too long for the server to respond",
        None::<reqwest::Error>,
      );
    }

    let mut message = "An unexpected error occured while sending the request";

    if e.is_status() {
      message = "A failure occured while sending the request";
    } else if e.is_decode() {
      message = "A failure occured while parsing the response";
    }

    Self::critical(message, Some(e))
  }
}

impl From<sled::Error> for BackendError {
  fn from(e: sled::Error) -> Self {
    Self::critical("A failure occured while working with the database", Some(e))
  }
}

impl From<bincode::Error> for BackendError {
  fn from(e: bincode::Error) -> Self {
    Self::critical("A failure occured while preparing data", Some(e))
  }
}

impl From<aes_gcm::Error> for BackendError {
  fn from(e: aes_gcm::Error) -> Self {
    Self::critical("A failure occured while encrypting data", Some(e))
  }
}

impl From<FromUtf8Error> for BackendError {
  fn from(e: FromUtf8Error) -> Self {
    Self::critical(
      "A failure occured while converting raw data to string",
      Some(e),
    )
  }
}

impl<T> From<PoisonError<T>> for BackendError {
  fn from(e: PoisonError<T>) -> Self {
    Self::critical("A failure occured while locking state", Some(e))
  }
}
