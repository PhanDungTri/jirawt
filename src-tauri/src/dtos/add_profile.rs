use serde::Deserialize;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddProfileDTO {
  pub profile_name: String,
  pub email: String,
  pub personal_access_token: String,
  pub security_code: Option<String>,
}
