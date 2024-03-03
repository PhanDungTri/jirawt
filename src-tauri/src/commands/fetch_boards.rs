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
struct BoardsResponseData {
  total: u16,
  values: Vec<BoardData>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BoardData {
  id: u32,
  name: String,
}

#[tauri::command]
pub async fn fetch_boards(
  profile_state: State<'_, ProfileState>,
) -> Result<Vec<BoardData>, BackendError> {
  let client = Client::new();
  let credentials = profile_state.get_credentials()?;

  let total_boards = count_total_boards(&client, &credentials).await?;
  let sprints = get_boards(&client, &credentials, total_boards).await?;

  Ok(sprints)
}

fn generate_fetch_boards_url(max_results: u16, start_at: u16) -> String {
  format!(
    "{BASE_JIRA_API_URL}/agile/1.0/board?maxResults={}&startAt={}",
    max_results, start_at
  )
}

async fn count_total_boards(
  client: &Client,
  credentials: &(String, String),
) -> Result<u16, reqwest::Error> {
  let url = generate_fetch_boards_url(1, 0);

  let total = get_jira_api(client, url, credentials)
    .await?
    .json::<BoardsResponseData>()
    .await?
    .total;

  Ok(total)
}

async fn get_boards(
  client: &Client,
  credentials: &(String, String),
  total_boards: u16,
) -> Result<Vec<BoardData>, reqwest::Error> {
  let number_of_requests = get_number_of_requests(total_boards);

  let urls = (0..number_of_requests)
    .map(|start_at| generate_fetch_boards_url(MAX_RESULTS, start_at * MAX_RESULTS))
    .collect::<Vec<String>>();

  let results = try_join_all(urls.into_iter().map(|url| async {
    let response = get_jira_api(client, url, credentials).await?;

    response.json::<BoardsResponseData>().await
  }))
  .await?;

  let boards = results
    .into_iter()
    .flat_map(|result| result.values)
    .collect();

  Ok(boards)
}
