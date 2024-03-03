use reqwest::{Client, StatusCode};

use crate::constants::BASE_JIRA_API_URL;
use crate::{dtos::MyselfDTO, utils::get_jira_api};

pub async fn authenticate_profile(
  email: &str,
  personal_access_token: &str,
) -> Result<Option<MyselfDTO>, reqwest::Error> {
  let url = format!("{BASE_JIRA_API_URL}/api/2/myself");
  let client = Client::new();
  let res = get_jira_api(&client, url, &(email.into(), personal_access_token.into())).await?;

  if res.status() == StatusCode::UNAUTHORIZED {
    return Ok(None);
  }

  let myself = res.json::<MyselfDTO>().await?;

  Ok(Some(myself))
}
