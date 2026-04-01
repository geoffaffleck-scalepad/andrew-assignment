#!/usr/bin/env python3
import argparse
import json
from urllib import error, parse, request


def call_api(method: str, url: str, payload: dict | None = None, timeout: int = 10):
    headers = {"Content-Type": "application/json"}
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = request.Request(url=url, data=data, headers=headers, method=method)

    try:
        with request.urlopen(req, timeout=timeout) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, json.loads(body) if body else None
    except error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            parsed_body = json.loads(body) if body else None
        except json.JSONDecodeError:
            parsed_body = body
        return e.code, parsed_body


def print_result(label: str, status: int, body):
    print(f"\n=== {label} ===")
    print(f"Status: {status}")
    print("Body:")
    print(json.dumps(body, indent=2, default=str))


def main():
    parser = argparse.ArgumentParser(description="Simple backend API test script")
    parser.add_argument(
        "--base-url",
        default="http://localhost:8000",
        help="API base URL (default: http://localhost:8000)",
    )
    args = parser.parse_args()

    base_url = args.base_url.rstrip("/")

    login_payload = {
        "email": "seller@example.com",
        "password": "password123",
    }
    status, logged_in_user = call_api("POST", f"{base_url}/login", login_payload)
    print_result("POST /login", status, logged_in_user)

    seller_id = logged_in_user.get("id") if isinstance(logged_in_user, dict) else None
    if seller_id is None:
        print("\nSkipping listing tests because login failed.")
        return

    listing_payload = {
        "title": "Custom Runner Prototype",
        "description": "Breathable trainer with custom colorway.",
        "price": 149.99,
        "image_url": "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTsd_7l-zJRJuf4kn8iQvmBY60VtSWbPGLURgk8Op9JEt6NAhEAfAVXrbraEXE0t3EaNd2AItfvDTVhw5xT8N1mfzEn-xetVWZma_UFlG3zrBYWaWYGoYr6rnenBpG29qE1GmgubcCGNA&usqp=CAc",
        "size": 9.5,
        "materials": ["mesh", "rubber"],
        "colors": ["blue", "white"],
        "style": "sport",
        "seller_id": seller_id,
    }

    status, created = call_api("POST", f"{base_url}/listings", listing_payload)
    print_result("POST /listings", status, created)

    listing_id = created.get("id") if isinstance(created, dict) else None

    status, listings = call_api("GET", f"{base_url}/listings")
    print_result("GET /listings", status, listings)

    params = parse.urlencode({"search": "runner", "min_price": 100, "style": "sport"})
    status, filtered = call_api("GET", f"{base_url}/listings?{params}")
    print_result("GET /listings (with filters)", status, filtered)

    if listing_id is not None:
        status, single = call_api("GET", f"{base_url}/listings/{listing_id}")
        print_result("GET /listings/{listing_id}", status, single)
    else:
        print("\nSkipping GET /listings/{listing_id} because create failed.")

    status, seller_listings = call_api(
        "GET", f"{base_url}/sellers/{listing_payload['seller_id']}/listings"
    )
    print_result("GET /sellers/{seller_id}/listings", status, seller_listings)


if __name__ == "__main__":
    main()
