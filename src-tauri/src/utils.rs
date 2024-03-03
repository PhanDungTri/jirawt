use reqwest::{Client, Response};

use crate::constants::MAX_RESULTS;

pub fn get_number_of_requests(total: u16) -> u16 {
  let ratio = total as f32 / MAX_RESULTS as f32;

  ratio.ceil() as u16
}

pub async fn get_jira_api(
  client: &Client,
  url: String,
  credentials: &(String, String),
) -> Result<Response, reqwest::Error> {
  let (username, password) = credentials;

  let response = client
    .get(url)
    .basic_auth(username, Some(password))
    .send()
    .await?;

  Ok(response)
}
