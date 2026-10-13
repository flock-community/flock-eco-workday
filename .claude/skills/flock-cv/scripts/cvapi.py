"""Small client for the Workday CV and logo API (stdlib only).

Usage: python3 -I cvapi.py <command> [args]

  whoami                      the user and person behind the token
  persons                     uuid and name of every person
  logos                       the shared logo collection
  list [PERSON_UUID]          CVs (all for an admin, or of one person)
  get CODE                    a CV as the API returns it
  get-form CODE               a CV as an editable CvForm (with personId and logoIds kept)
  create FORM.json            POST /api/cvs
  put CODE FORM.json          PUT /api/cvs/CODE (a full replacement, see SKILL.md)
  upload-logo NAME IMAGE      POST /api/logos (png, jpeg, gif, webp or svg, max 512 KB)
  data-url IMAGE              an image file as a `data:<type>;base64,...` string, for form.json's `photo`
  text PDF                    the resume's text in reading order (one paragraph or table row per line)
  parse PDF [NAME [PERSON]]   a CvForm draft parsed from the resume; notes on what to check on stderr
  extract-images PDF OUTDIR   every image in the PDF as PNG/JPEG/TIFF (poppler's "-all" mode)

PDF reading shells out to poppler's `pdftotext` and `pdfimages` (cvtext.py next to this file).
Check both are on PATH (`which pdftotext pdfimages`) before running any PDF command; if either is
missing, ask the user for y/n permission to install poppler before installing it yourself. See
SKILL.md.

Environment: WORKDAY_TOKEN (required), WORKDAY_URL (default http://localhost:8080).
"""

import base64
import json
import mimetypes
import os
import sys
import urllib.error
import urllib.request

# -I leaves the script's own directory off sys.path; cvtext.py lives next to this file.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.dont_write_bytecode = True
import cvtext  # noqa: E402

BASE = os.environ.get("WORKDAY_URL", "http://localhost:8080").rstrip("/")


def call(method, path, body=None):
    token = os.environ.get("WORKDAY_TOKEN")
    if not token:
        sys.exit("Set WORKDAY_TOKEN to a user key token")
    req = urllib.request.Request(
        BASE + path,
        method=method,
        data=None if body is None else json.dumps(body, ensure_ascii=False).encode(),
        headers={"Authorization": f"TOKEN {token}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req) as res:
            raw = res.read()
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        sys.exit(f"{method} {path} -> {e.code}: {e.read().decode(errors='replace')}")


def out(value):
    print(json.dumps(value, ensure_ascii=False, indent=1))


def data_url(path):
    kind = mimetypes.guess_type(path)[0] or "image/png"
    return f"data:{kind};base64," + base64.b64encode(open(path, "rb").read()).decode()


def to_form(cv):
    """The Cv response turned into the CvForm a PUT takes; personId keeps the owner."""
    return {
        "personId": cv["person"]["uuid"],
        "name": cv["name"],
        "language": cv["language"],
        "place": cv.get("place"),
        "phone": cv.get("phone"),
        "summary": cv.get("summary"),
        "experiences": [
            {k: e.get(k) for k in ("from", "to", "role", "client", "employer", "technologies", "description", "logoId")}
            for e in cv.get("experiences") or []
        ],
        "skills": [{k: s.get(k) for k in ("category", "name", "level")} for s in cv.get("skills") or []],
        "education": cv.get("education"),
        "subjects": cv.get("subjects"),
        "languages": cv.get("languages"),
        "photo": cv.get("photo"),
    }


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    cmd, args = sys.argv[1], sys.argv[2:]
    if cmd == "whoami":
        user = call("GET", "/api/users/me")
        person = call("GET", "/api/persons/me")
        out({"user": user["name"], "cvAuthorities": [a for a in user["authorities"] if a.startswith("CvAuthority")],
             "person": person and {"uuid": person["uuid"], "name": f"{person['firstname']} {person['lastname']}"}})
    elif cmd == "persons":
        for p in call("GET", "/api/persons?size=1000"):
            print(p["uuid"], p["firstname"], p["lastname"])
    elif cmd == "logos":
        for logo in call("GET", "/api/logos"):
            print(logo["id"], logo["name"])
    elif cmd == "list":
        query = f"?size=1000&personId={args[0]}" if args else "?size=1000"
        for cv in call("GET", "/api/cvs" + query):
            print(cv["code"], cv["language"], cv["name"], "|", cv["person"]["firstname"], cv["person"]["lastname"])
    elif cmd == "get":
        out(call("GET", f"/api/cvs/{args[0]}"))
    elif cmd == "get-form":
        out(to_form(call("GET", f"/api/cvs/{args[0]}")))
    elif cmd == "create":
        cv = call("POST", "/api/cvs", json.load(open(args[0])))
        print(cv["code"], cv["name"], "| person", cv["person"]["firstname"], cv["person"]["lastname"])
    elif cmd == "put":
        form = json.load(open(args[1]))
        if not form.get("personId"):
            sys.exit("personId is missing: without it the CV moves to the person behind the token (use get-form)")
        cv = call("PUT", f"/api/cvs/{args[0]}", form)
        print(cv["code"], cv["name"], "| person", cv["person"]["firstname"], cv["person"]["lastname"])
    elif cmd == "upload-logo":
        logo = call("POST", "/api/logos", {"name": args[0], "image": data_url(args[1])})
        print(logo["id"], logo["name"], logo["contentType"])
    elif cmd == "data-url":
        print(data_url(args[0]))
    elif cmd == "text":
        sys.stdout.write(cvtext.render_text(args[0]))
    elif cmd == "parse":
        notes = set()
        form, full_name, _ = cvtext.parse_resume(args[0], notes)
        if len(args) > 1:
            form["name"] = args[1]
        if len(args) > 2:
            form["personId"] = args[2]
        out(form)
        print(f"person on the resume: {full_name or '?'}", file=sys.stderr)
        for note in sorted(notes):
            print("note:", note, file=sys.stderr)
        if not form["name"]:
            print("note: name is null; set the CV name the user chose before create", file=sys.stderr)
    elif cmd == "extract-images":
        imgs = cvtext.extract_all_images(args[0], args[1])
        by_page = {}
        for page, _, name in imgs:
            by_page.setdefault(page, []).append(name)
        for page in sorted(by_page):
            print(f"page {page}: {', '.join(by_page[page])}")
        print(f"{len(imgs)} files written to {args[1]}")
        print("The same image reused across several pages is page decoration (header logo, "
              "background), not an assignment logo. A page with more than one assignment needs a "
              "manual check to tell which image belongs to which.")
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    try:
        main()
    except ValueError as e:
        sys.exit(f"cannot read the PDF: {e}")
