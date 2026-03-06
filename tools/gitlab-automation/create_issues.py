# create_issues
#
# This script reads the project task configuration files and automatically
# creates GitLab issues for the Afterglow project board. It assigns milestones,
# labels, and team members to each issue to ensure the GitLab issue tracker
# reflects the planned project timeline and responsibilities.
#
# The goal is to keep issue creation consistent and reproducible so the
# project board can be regenerated or updated without manually creating
# dozens of issues in GitLab.

# AI Usage Notice
# AI tools were used to assist with organizing the project timeline and generating
# initial draft task descriptions for the issue tracker. All tasks were reviewed,
# edited, and finalized by the project team. AI was used as a planning aid.

import os
import sys
import time
from urllib.parse import quote_plus

import requests
import yaml
from dotenv import load_dotenv


load_dotenv()

BASE_URL = os.getenv("GITLAB_BASE_URL", "").rstrip("/")
TOKEN = os.getenv("GITLAB_TOKEN", "")
PROJECT_PATH = os.getenv("GITLAB_PROJECT_PATH", "")

if not BASE_URL or not TOKEN or not PROJECT_PATH:
    print("Missing one or more required environment variables:")
    print("- GITLAB_BASE_URL")
    print("- GITLAB_TOKEN")
    print("- GITLAB_PROJECT_PATH")
    sys.exit(1)

HEADERS = {
    "PRIVATE-TOKEN": TOKEN,
    "Content-Type": "application/json",
}


def api(method: str, path: str, max_retries: int = 5, **kwargs):
    url = f"{BASE_URL}/api/v4{path}"

    for attempt in range(max_retries):
        response = requests.request(method, url, headers=HEADERS, timeout=30, **kwargs)

        if response.status_code == 429:
            retry_after = response.headers.get("Retry-After")
            wait_seconds = int(retry_after) if retry_after and retry_after.isdigit() else 10
            print(f"Rate limited on {method} {path}. Waiting {wait_seconds}s before retrying...")
            time.sleep(wait_seconds)
            continue

        if response.status_code >= 400:
            print(f"API error {response.status_code} on {method} {path}")
            print(response.text)
            response.raise_for_status()

        if response.text:
            return response.json()
        return None

    raise RuntimeError(f"Max retries exceeded for {method} {path}")


def get_project():
    encoded = quote_plus(PROJECT_PATH)
    return api("GET", f"/projects/{encoded}")


def get_all_project_labels(project_id: int):
    labels = []
    page = 1

    while True:
        batch = api(
            "GET",
            f"/projects/{project_id}/labels",
            params={"per_page": 100, "page": page},
        )
        if not batch:
            break

        labels.extend(batch)

        if len(batch) < 100:
            break

        page += 1

    return labels


def get_all_existing_issues(project_id: int):
    issues = []
    page = 1

    while True:
        batch = api(
            "GET",
            f"/projects/{project_id}/issues",
            params={
                "state": "all",
                "per_page": 100,
                "page": page,
                "order_by": "created_at",
                "sort": "asc",
            },
        )
        if not batch:
            break

        issues.extend(batch)

        if len(batch) < 100:
            break

        page += 1

    return issues


def ensure_milestone(project_id: int, title: str, due_date: str = None, description: str = None):
    existing = api(
        "GET",
        f"/projects/{project_id}/milestones",
        params={"search": title, "per_page": 100},
    )

    for milestone in existing:
        if milestone["title"] == title:
            return milestone

    payload = {"title": title}
    if due_date:
        payload["due_date"] = due_date
    if description:
        payload["description"] = description

    return api("POST", f"/projects/{project_id}/milestones", json=payload)


def get_user_id(username: str):
    if not username:
        return None

    users = api("GET", "/users", params={"username": username})
    if not users:
        print(f"Warning: could not find user '{username}'")
        return None

    return users[0]["id"]


def create_issue(project_id: int, issue_data: dict, milestone_ids: dict, user_ids: dict):
    labels = issue_data.get("labels", [])
    milestone_title = issue_data.get("milestone")
    milestone_id = milestone_ids.get(milestone_title)

    assignee_key = issue_data.get("assignee")
    assignee_id = user_ids.get(assignee_key)

    payload = {
        "title": issue_data["title"],
        "description": issue_data.get("description", "").strip(),
        "labels": ",".join(labels),
    }

    if milestone_id:
        payload["milestone_id"] = milestone_id

    if assignee_id:
        payload["assignee_ids"] = [assignee_id]

    issue = api("POST", f"/projects/{project_id}/issues", json=payload)
    print(f"Created issue #{issue['iid']}: {issue['title']}")
    return issue


def create_label(project_id: int, name: str, color: str = "#428BCA"):
    """Create a label in GitLab with the given name and color."""
    payload = {
        "name": name,
        "color": color,
    }
    label = api("POST", f"/projects/{project_id}/labels", json=payload)
    print(f"Created label: {name} (color: {color})")
    return label


def get_label_color(label_name: str) -> str:
    """Return a sensible default color based on label prefix."""
    label_colors = {
        "type:": "#5CB85C",      # green for type
        "priority:": "#D9534F",  # red for priority
        "area:": "#428BCA",      # blue for area
        "status:": "#F0AD4E",    # orange for status
    }
    
    for prefix, color in label_colors.items():
        if label_name.startswith(prefix):
            return color
    
    return "#7F8C8D"  # gray default


def validate_labels(project_id: int, yaml_issues: list, auto_create: bool = True):
    existing_labels = {label["name"] for label in get_all_project_labels(project_id)}
    missing = set()

    for issue in yaml_issues:
        for label in issue.get("labels", []):
            if label not in existing_labels:
                missing.add(label)

    if missing:
        print("These labels are referenced in YAML but do not exist in GitLab:")
        for label in sorted(missing):
            print(f"- {label}")
        
        if auto_create:
            print("\nCreating missing labels...")
            for label in sorted(missing):
                color = get_label_color(label)
                create_label(project_id, label, color)
                existing_labels.add(label)
            print("All labels created successfully.\n")
        else:
            print("\nCreate them first, then run the script again.")
            sys.exit(1)


def main(yaml_path: str):
    with open(yaml_path, "r", encoding="utf-8") as file:
        config = yaml.safe_load(file)

    project = get_project()
    project_id = project["id"]
    print(f"Connected to project: {project['path_with_namespace']} (ID: {project_id})")

    issues = config.get("issues", [])
    validate_labels(project_id, issues)

    user_ids = {}
    for key, username in config.get("users", {}).items():
        if username:
            user_ids[key] = get_user_id(username)

    milestone_ids = {}
    for milestone in config.get("milestones", []):
        created = ensure_milestone(
            project_id=project_id,
            title=milestone["title"],
            due_date=milestone.get("due_date"),
            description=milestone.get("description"),
        )
        milestone_ids[milestone["title"]] = created["id"]

    existing_issues = get_all_existing_issues(project_id)
    existing_titles = {issue["title"] for issue in existing_issues}

    print(f"Found {len(existing_titles)} existing issues in project.")

    created_count = 0
    skipped_count = 0

    for issue in issues:
        if issue["title"] in existing_titles:
            print(f"Skipping existing issue: {issue['title']}")
            skipped_count += 1
            continue

        created = create_issue(project_id, issue, milestone_ids, user_ids)
        existing_titles.add(created["title"])
        created_count += 1

        time.sleep(0.3)

    print("\nDone.")
    print(f"Created: {created_count}")
    print(f"Skipped: {skipped_count}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage:")
        print("python tools/gitlab-automation/create_issues.py tools/gitlab-automation/tasks.afterglow.yaml")
        sys.exit(1)

    main(sys.argv[1])