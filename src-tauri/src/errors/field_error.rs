use serde::Serialize;

#[derive(Serialize)]
pub struct FieldError {
  pub field: String,
  pub message: String,
}

impl FieldError {
  pub fn new(field: &str, message: &str) -> Self {
    Self {
      field: field.into(),
      message: message.into(),
    }
  }
}
