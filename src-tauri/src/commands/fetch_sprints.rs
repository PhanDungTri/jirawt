use futures::future::try_join_all;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::{
  constants::{BASE_JIRA_API_URL, MAX_RESULTS},
  errors::BackendError,
  states::ProfileState,
  utils::{get_jira_api, get_number_of_requests},
};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SprintsResponseData {
  total: u16,
  values: Vec<SprintData>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SprintData {
  id: u32,
  name: String,
  created_date: String,
}

#[tauri::command]
pub async fn fetch_sprints(
  profile_state: State<'_, ProfileState>,
  board_id: u32,
) -> Result<Vec<SprintData>, BackendError> {
  let client = Client::new();
  let credentials = profile_state.get_credentials()?;
  let total_sprints = count_total_sprints(&client, &credentials, board_id).await?;
  let sprints = get_sprints(&client, &credentials, board_id, total_sprints).await?;

  Ok(sprints)
}

fn generate_fetch_sprints_url(board_id: u32, max_results: u16, start_at: u16) -> String {
  format!(
    "{BASE_JIRA_API_URL}/agile/1.0/board/{}/sprint?maxResults={}&startAt={}",
    board_id, max_results, start_at
  )
}

async fn count_total_sprints(
  client: &Client,
  credentials: &(String, String),
  board_id: u32,
) -> Result<u16, reqwest::Error> {
  let url = generate_fetch_sprints_url(board_id, 1, 0);

  let total = get_jira_api(client, url, credentials)
    .await?
    .json::<SprintsResponseData>()
    .await?
    .total;

  Ok(total)
}

async fn get_sprints(
  client: &Client,
  credentials: &(String, String),
  board_id: u32,
  total_sprints: u16,
) -> Result<Vec<SprintData>, reqwest::Error> {
  let number_of_requests = get_number_of_requests(total_sprints);

  let urls = (0..number_of_requests)
    .map(|start_at| generate_fetch_sprints_url(board_id, MAX_RESULTS, start_at * MAX_RESULTS))
    .collect::<Vec<String>>();

  let results = try_join_all(urls.into_iter().map(|url| async {
    let response = get_jira_api(client, url, credentials).await?;

    response.json::<SprintsResponseData>().await
  }))
  .await?;

  let sprints = results
    .into_iter()
    .flat_map(|result| result.values)
    .collect();

  Ok(sprints)
}
