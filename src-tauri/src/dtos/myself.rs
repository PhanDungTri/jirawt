use serde::Deserialize;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MyselfDTO {
  pub account_id: String,
  pub display_name: String,
}
