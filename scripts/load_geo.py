"""
Utility script to seed the backend database with geographic entities.

This script sends HTTP POST requests to the deployed Flask backend
bulk endpoints to create starter data for:
- countries
- states
- cities
"""

import json
import os
import argparse
import requests


def post_bulk(
    session: requests.Session, base_url: str, path: str, items: list
):
    url = f"{base_url.rstrip('/')}{path}"
    if not items:
        print(f"Skip {path}: no items")
        return

    # Send HTTP POST request to backend bulk endpoint
    r = session.post(url, json=items, timeout=30)
    if r.status_code not in (200, 201, 207):
        raise RuntimeError(f"POST {url} failed: {r.status_code} {r.text}")

    print(f"{path}: status={r.status_code}")
    try:
        print(json.dumps(r.json(), indent=2))
    except Exception:
        print(r.text)


def main():
    # Take command-line arguments
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--base-url", required=True,
        help="Backend base URL, e.g. https://xxxx.pythonanywhere.com"
    )
    parser.add_argument("--file", default="seed_geo.json")
    parser.add_argument("--api-key", default=os.getenv("API_KEY", ""))
    args = parser.parse_args()

    # Read from seed_geo.json
    with open(args.file, "r", encoding="utf-8") as f:
        seed = json.load(f)

    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    if args.api_key:
        session.headers.update({"X-API-KEY": args.api_key})

    post_bulk(
        session, args.base_url, "/countries/bulk", seed.get("countries", [])
    )
    post_bulk(session, args.base_url, "/states/bulk", seed.get("states", []))
    post_bulk(session, args.base_url, "/cities/bulk", seed.get("cities", []))

    print("Done seeding.")


if __name__ == "__main__":
    main()
