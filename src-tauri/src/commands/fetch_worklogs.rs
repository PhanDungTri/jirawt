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
struct IssueData {
  id: String,
  key: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct IssuesResponseData {
  total: u16,
  issues: Vec<IssueData>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct WorklogAuthorData {
  account_id: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorklogData {
  author: WorklogAuthorData,
  time_spent_seconds: u32,
  id: String,
  started: String,
  issue_id: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct IssueWorklogsResponseData {
  total: u16,
  worklogs: Vec<WorklogData>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorklogDTO {
  id: String,
  issue_key: String,
  time_spent_seconds: u32,
  started: String,
}

#[tauri::command]
pub async fn fetch_worklogs(
  profile_state: State<'_, ProfileState>,
  sprint_id: u32,
) -> Result<Vec<WorklogDTO>, BackendError> {
  let client = Client::new();
  let credentials = profile_state.get_credentials()?;
  let account_id = profile_state.get_account_id()?;
  let total_issues = count_total_issues(&client, &credentials, sprint_id).await?;
  let issues = get_issue_ids(&client, &credentials, sprint_id, total_issues).await?;
  let total_worklogs_by_issue_ids =
    count_total_worklogs_by_issues(&client, &credentials, &issues).await?;
  let worklogs = get_worklogs(&client, &credentials, total_worklogs_by_issue_ids).await?;
  let worklogs_by_account_id = worklogs
    .into_iter()
    .filter(|worklog| worklog.author.account_id == account_id)
    .filter_map(|worklog| {
      issues
        .iter()
        .find(|issue| issue.id == worklog.issue_id)
        .map(|issue| WorklogDTO {
          id: worklog.id,
          issue_key: issue.key.clone(),
          started: worklog.started,
          time_spent_seconds: worklog.time_spent_seconds,
        })
    })
    .collect();

  Ok(worklogs_by_account_id)
}

fn generate_fetch_issues_url(sprint_id: u32, max_results: u16, start_at: u16) -> String {
  format!(
    "{BASE_JIRA_API_URL}/agile/1.0/sprint/{}/issue?fields=null&maxResults={}&startAt={}",
    sprint_id, max_results, start_at
  )
}

fn generate_fetch_issue_worklogs_url(issue_id: &str, max_results: u16, start_at: u16) -> String {
  format!(
    "{BASE_JIRA_API_URL}/api/2/issue/{}/worklog?maxResults={}&startAt={}",
    issue_id, max_results, start_at,
  )
}

async fn count_total_issues(
  client: &Client,
  credentials: &(String, String),
  sprint_id: u32,
) -> Result<u16, reqwest::Error> {
  let url = generate_fetch_issues_url(sprint_id, 1, 0);

  let total = get_jira_api(client, url, credentials)
    .await?
    .json::<IssuesResponseData>()
    .await?
    .total;

  Ok(total)
}

async fn get_issue_ids(
  client: &Client,
  credentials: &(String, String),
  sprint_id: u32,
  total_issues: u16,
) -> Result<Vec<IssueData>, reqwest::Error> {
  let (username, password) = credentials;
  let number_of_requests = get_number_of_requests(total_issues);
  let urls: Vec<String> = (0..number_of_requests)
    .map(|start_at| generate_fetch_issues_url(sprint_id, MAX_RESULTS, start_at * MAX_RESULTS))
    .collect();

  let results = try_join_all(urls.into_iter().map(|url| async {
    client
      .get(url)
      .basic_auth(username, Some(password))
      .send()
      .await?
      .json::<IssuesResponseData>()
      .await
  }))
  .await?;

  let issues = results
    .into_iter()
    .flat_map(|result| result.issues)
    .collect::<Vec<IssueData>>();

  Ok(issues)
}

async fn count_total_worklogs_by_issues(
  client: &Client,
  credentials: &(String, String),
  issues: &[IssueData],
) -> Result<Vec<(String, u16)>, reqwest::Error> {
  let results = try_join_all(issues.iter().map(|issue| async {
    let url = generate_fetch_issue_worklogs_url(&issue.id, 1, 0);
    let response = get_jira_api(client, url, credentials).await?;

    response.json::<IssueWorklogsResponseData>().await
  }))
  .await?;

  let mut total_worklogs_by_issue_ids = Vec::<(String, u16)>::new();

  for result in results {
    if result.total > 0 {
      if let Some(worklog) = result.worklogs.first() {
        total_worklogs_by_issue_ids.push((worklog.issue_id.to_owned(), result.total));
      }
    }
  }

  Ok(total_worklogs_by_issue_ids)
}

async fn get_worklogs(
  client: &Client,
  credentials: &(String, String),
  total_worklogs_by_issue_ids: Vec<(String, u16)>,
) -> Result<Vec<WorklogData>, reqwest::Error> {
  let (username, password) = credentials;
  let mut urls = Vec::<String>::new();

  for (issue_id, total_worklogs) in total_worklogs_by_issue_ids {
    let number_of_requests = get_number_of_requests(total_worklogs);

    for start_at in 0..number_of_requests {
      let url = generate_fetch_issue_worklogs_url(&issue_id, MAX_RESULTS, start_at * MAX_RESULTS);

      urls.push(url);
    }
  }

  let results = try_join_all(urls.into_iter().map(|url| async {
    client
      .get(url)
      .basic_auth(username, Some(password))
      .send()
      .await?
      .json::<IssueWorklogsResponseData>()
      .await
  }))
  .await?;

  let worklogs = results
    .into_iter()
    .flat_map(|result| result.worklogs)
    .collect();

  Ok(worklogs)
}
