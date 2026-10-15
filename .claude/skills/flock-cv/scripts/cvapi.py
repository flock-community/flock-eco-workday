"""Small client for the Workday CV and logo API (stdlib only).

Usage: python3 -I cvapi.py <command> [args]

  whoami                      the user and person behind the token
  persons                     uuid and name of every person
  logos                       the shared logo collection
  list [PERSON_UUID]          CVs (all for an admin, or of one person)
  get CODE                    a CV as the API returns it
  get-form CODE               a CV as an editable CvForm (with personId, logoIds and photo kept)
  create FORM.json            POST /api/cvs; a `photo` in the form is applied to the person after
  put CODE FORM.json          PUT /api/cvs/CODE (a full replacement, see SKILL.md); same for `photo`
  set-photo PERSON_UUID [IMG] the person's photo directly: replaces it with IMG, or removes it when
                               IMG is omitted. create/put call this for you when form.json has a
                               `photo`; use it standalone to fix up a photo without touching the CV.
  upload-logo NAME IMAGE      POST /api/logos (png, jpeg, gif, webp or svg, max 512 KB)
  data-url IMAGE              an image file as a `data:<type>;base64,...` string, for form.json's `photo`
  text PDF                    the resume's text in reading order (one paragraph or table row per line)
  parse PDF [NAME [PERSON]]   a CvForm draft parsed from the resume; notes on what to check on stderr
  extract-images PDF OUTDIR   every image in the PDF as PNG/JPEG/TIFF (poppler's "-all" mode)

PDF reading shells out to poppler's `pdftotext` and `pdfimages` (cvtext.py next to this file).
Check both are on PATH (`which pdftotext pdfimages`) before running any PDF command; if either is
missing, ask the user for y/n permission to install poppler before installing it yourself. See
SKILL.md.

Environment: WORKDAY_TOKEN (required; falls back to the contents of ~/.secrets/WORKDAY_TOKEN
if unset), WORKDAY_URL (default https://workday.flock.community; if left at that default and
the request can't even connect - no server reachable, not an HTTP error - it retries once
against http://localhost:8080). Set WORKDAY_URL explicitly to skip that fallback.
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

PROD_URL = "https://workday.flock.community"
LOCAL_URL = "http://localhost:8080"

_env_url = os.environ.get("WORKDAY_URL")
BASE = (_env_url or PROD_URL).rstrip("/")
# Only fall back to localhost when the caller didn't pin WORKDAY_URL themselves.
ALLOW_LOCAL_FALLBACK = not _env_url

SECRETS_TOKEN_FILE = os.path.join(os.path.expanduser("~"), ".secrets", "WORKDAY_TOKEN")


def get_token():
    token = os.environ.get("WORKDAY_TOKEN")
    if token:
        return token
    try:
        with open(SECRETS_TOKEN_FILE) as f:
            return f.read().strip() or None
    except OSError:
        return None


def call(method, path, body=None):
    global BASE
    token = get_token()
    if not token:
        sys.exit(f"Set WORKDAY_TOKEN to a user key token, or put it in {SECRETS_TOKEN_FILE}")
    data = None if body is None else json.dumps(body, ensure_ascii=False).encode()
    headers = {"Authorization": f"TOKEN {token}", "Content-Type": "application/json"}

    def attempt(base):
        req = urllib.request.Request(base + path, method=method, data=data, headers=headers)
        with urllib.request.urlopen(req) as res:
            raw = res.read()
            return json.loads(raw) if raw else None

    try:
        return attempt(BASE)
    except urllib.error.HTTPError as e:
        sys.exit(f"{method} {path} -> {e.code}: {e.read().decode(errors='replace')}")
    except urllib.error.URLError as e:
        # Not an HTTP error response - the request never reached a server (DNS failure,
        # connection refused, ...), so retrying elsewhere can't double-submit anything.
        if not (ALLOW_LOCAL_FALLBACK and BASE != LOCAL_URL):
            sys.exit(f"{method} {path} -> could not connect to {BASE}: {e.reason}")
        print(f"Could not reach {BASE} ({e.reason}), falling back to {LOCAL_URL}", file=sys.stderr)
        BASE = LOCAL_URL
        try:
            return attempt(BASE)
        except urllib.error.HTTPError as e2:
            sys.exit(f"{method} {path} -> {e2.code}: {e2.read().decode(errors='replace')}")
        except urllib.error.URLError as e2:
            sys.exit(f"{method} {path} -> could not connect to {BASE} either: {e2.reason}")


def out(value):
    print(json.dumps(value, ensure_ascii=False, indent=1))


def data_url(path):
    kind = mimetypes.guess_type(path)[0] or "image/png"
    return f"data:{kind};base64," + base64.b64encode(open(path, "rb").read()).decode()


def to_form(cv):
    """The Cv response turned into the CvForm a PUT takes; personId keeps the owner.

    The photo lives on the person, not the CV; the Cv response carries it on its person, so
    no person read (and no person rights) is needed.
    """
    person = cv["person"]
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
        "photo": person.get("photo"),
    }


# A form.json's "photo" key may be: absent (keep as is), "" (remove), or a data URL (replace).
# This sentinel tells "absent" apart from "present but falsy", which json.load can't do with None.
_NO_PHOTO_KEY = object()


def set_person_photo(person_uuid, photo_value):
    """Applies photo_value ("" removes it, a data URL replaces it) to a person's photo.

    PUT /api/persons/{uuid} is a full replacement of the person (see PersonService.render),
    so every other field is round-tripped from a fresh GET first - including userCode, taken
    from the nested user's `id` (which is the backing User.code, not the display name), so
    the login user stays linked to this person. Without being a person admin this needs person
    read and write rights and works on your own person only, keeping the admin-only fields.
    """
    person = call("GET", f"/api/persons/{person_uuid}")
    user = person.get("user")
    form = {
        "firstname": person.get("firstname"),
        "lastname": person.get("lastname"),
        "email": person.get("email"),
        "position": person.get("position"),
        "number": person.get("number"),
        "birthdate": person.get("birthdate"),
        "joinDate": person.get("joinDate"),
        "active": person.get("active"),
        "userCode": user["id"] if user else None,
        "reminders": person.get("reminders"),
        "receiveEmail": person.get("receiveEmail"),
        "shoeSize": person.get("shoeSize"),
        "shirtSize": person.get("shirtSize"),
        "googleDriveId": person.get("googleDriveId"),
        "address": person.get("address"),
        "photo": photo_value,
    }
    return call("PUT", f"/api/persons/{person_uuid}", form)


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
        form = json.load(open(args[0]))
        photo = form.pop("photo", _NO_PHOTO_KEY)
        cv = call("POST", "/api/cvs", form)
        print(cv["code"], cv["name"], "| person", cv["person"]["firstname"], cv["person"]["lastname"])
        if photo not in (_NO_PHOTO_KEY, None, ""):
            set_person_photo(cv["person"]["uuid"], photo)
            print("photo applied to", cv["person"]["firstname"], cv["person"]["lastname"])
    elif cmd == "put":
        form = json.load(open(args[1]))
        if not form.get("personId"):
            sys.exit("personId is missing: without it the CV moves to the person behind the token (use get-form)")
        photo = form.pop("photo", _NO_PHOTO_KEY)
        cv = call("PUT", f"/api/cvs/{args[0]}", form)
        print(cv["code"], cv["name"], "| person", cv["person"]["firstname"], cv["person"]["lastname"])
        if photo is not _NO_PHOTO_KEY:
            set_person_photo(cv["person"]["uuid"], photo or "")
            verb = "applied to" if photo else "removed from"
            print("photo", verb, cv["person"]["firstname"], cv["person"]["lastname"])
    elif cmd == "set-photo":
        photo = data_url(args[1]) if len(args) > 1 else ""
        person = set_person_photo(args[0], photo)
        verb = "set on" if photo else "removed from"
        print("photo", verb, person["firstname"], person["lastname"])
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
