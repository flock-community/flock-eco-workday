---
name: flock-cv
description: Insert a resume (usually a Flock CV PDF, from disk or Google Drive) into Workday as a CV through the CV API, with assignment logos, or edit specific parts of an existing CV (an assignment, the summary, skills, a logo), or tailor an existing CV's content to match a specific client/consultancy request. Use when asked to import, add, upload or insert a CV/resume, to change, fix or update part of a CV in the running Workday app, or to adjust/tailor someone's resume for a client request.
---

# Flock CV: insert and edit

Works against a running Workday backend (`cd workday-application && ../mvnw spring-boot:run -Pdevelop`,
port 8080). Everything goes through the API, never the database, so validation, revisions and
permissions apply.

The helper `scripts/cvapi.py` (stdlib only, run with `python3 -I`) wraps every call this needs.
Set `WORKDAY_TOKEN` to the token the user gives; `WORKDAY_URL` defaults to `http://localhost:8080`.
Run it without arguments for the command list. Keep intermediate files (extracted images, JSON
forms) in the scratchpad, not in the repo.

Reading the PDF (the `text`, `parse` and `extract-images` commands, implemented in
`scripts/cvtext.py`) shells out to **poppler**'s `pdftotext` and `pdfimages` CLIs. **Before the
first PDF command**, check both are on PATH: `which pdftotext pdfimages`. If either is missing,
ask the user a plain y/n: is it OK to install poppler? Do not install it yourself without that
confirmation. Once they say yes, install it (macOS: `brew install poppler`; Debian/Ubuntu:
`apt-get install poppler-utils`) and re-check before continuing. If they decline, stop here — the
skill cannot read a PDF without it.

Because this shells out to poppler instead of using a custom coordinate-aware renderer, it only
has plain text and page numbers to work with, not the exact x/y position of a logo or a run of
bold text. That mainly weakens the logo hints below (matched by page, not by proximity to the
assignment's text) and the column order of a two-column tech grid; everything else works the same
as before. Treat every hint as a starting point to verify, not a certainty — more so than usual
when a page holds more than one assignment (see "Logos" below).

## Before you start: token and CV name

Ask for what is missing **once, at the start**, in a single message, so the user is not interrupted
halfway through. Anything that needs no input (finding the PDF, reading it, extracting images) may
already be done before or while waiting.

1. **Token.** Use a token the user already gave in this conversation, or `$WORKDAY_TOKEN` if it is set
   in the environment (`echo ${WORKDAY_TOKEN:+set}`; never print the value). If neither exists, ask the
   user for a Workday API token as a **plain text message, not `AskUserQuestion`** — pasting a secret
   isn't a multiple-choice decision, and a question with only one real option is invalid input and gets
   rejected before the user ever sees it. Stop until they give it: never guess, borrow one from a file
   or config, or continue without it. Mention that an admin token (`CvAuthority.ADMIN`) is needed to put
   the CV on someone else's person. Shell state does not persist between Bash calls, so prefix every
   `cvapi.py` call with `WORKDAY_TOKEN=<token>`. If a call answers 401/403, say the token is invalid or
   lacks rights and ask for another one.
2. **CV name** (only when inserting a new CV; skip it for an edit unless the user wants a rename).
   Unless the user already named it, ask with `AskUserQuestion` (it has 3 genuinely distinct options,
   so it's a valid question on its own) using these options:
   - **Default (Recommended):** `<Full name> - <MM-YYYY>`, the resume's person and today's month,
     e.g. `Angelo Groot - 10-2026`. Show the actual proposed name in the option.
   - **General:** `General`, the person's all-round CV.
   - **For a specific client:** the user types the client (via "Other"); name the CV
     `<Full name> - <Client>`, e.g. `Angelo Groot - ING`, unless they give the full name themselves.
   The user may also type any other name. When the token is missing too, do **not** fold it into the
   same `AskUserQuestion` call — a token has no fixed set of options. Instead send one plain text
   message that asks for the token and also poses the CV-name question inline (default name plus the
   alternatives), or send the plain-text token request and the `AskUserQuestion` name question
   together in the same turn as two separate asks.
   After `list`, check the chosen name against that person's existing CVs (names are unique per
   person, 409 otherwise); on a collision, tell the user and ask again rather than adding a suffix
   yourself.

## The API in short

- Auth header is `Authorization: TOKEN <key>` (not Bearer). `cvapi.py whoami` shows who the token is
  and whether it has `CvAuthority.ADMIN`.
- `POST /api/cvs` and `PUT /api/cvs/{code}` take a `CvForm` (contract: `workday-application/src/main/wirespec/cvs.ws`,
  Kotlin: `forms/CvForm.kt`, mapping and validation: `controllers/CvController.kt`).
- There is **no PDF import endpoint** (`POST /api/cvs/import` was removed and answers 405). The
  `CvForm` is built locally with `cvapi.py parse` and checked by you.
- `GET/POST /api/logos`, `LogoForm {name, image}` where image is base64 or a data URL.

### CvForm fields

| field | notes |
|---|---|
| `personId` | Only honoured for an admin; otherwise the CV always goes to the token's own person. |
| `name` | Title of the CV, not the person's name (e.g. "General", "Cees Jansen - 08-2026"). 1-100 chars, **unique per person** (409 otherwise). |
| `language` | `EN` or `NL`, the language the CV is written in. |
| `place`, `phone`, `summary` | Plain text; summary keeps paragraphs as `\n\n`. |
| `experiences[]` | Newest first. `from`/`to` are `yyyy-MM`; `to: null` means "present". `role` and `client` required (max 255). `employer` is who the person worked through ("via Flock", "via Capgemini"), null when hired directly. `technologies` is a list of strings. `logoId` is a logo UUID or null. |
| `skills[]` | `{category, name, level}`. The CV groups by category in order of first appearance. Level 1-5 = number of stars; `level` is optional, so an unrated list gets `null`. |
| `education`, `subjects`, `languages` | Free text, one entry per line. |
| `photo` | The person's photo, shown in the header of each of their CVs: it is stored on the person, not the CV, so all CVs of a person share it. A base64 string, optionally a data URL (`data:image/png;base64,...`); PNG, JPEG, GIF, WebP or SVG, at most 512 KB (same ceiling as a logo). `null`/omitted leaves the person's photo as it is; `""` removes it. |

There is no field for: date of birth (that lives on the person), e-mail (person), a "Motivation"
section, or the work-experience overview table. Tell the user these were left out.

## Getting the resume from Google Drive

The steps below need the original PDF on disk: the text alone is not enough, because the logos are
images inside the PDF. Get it in this order of preference:

1. **Google Drive for desktop.** If installed, Drive is a normal folder at
   `~/Library/CloudStorage/GoogleDrive-<account>/` (`My Drive/`, `Shared drives/`). Find the file with
   `find ~/Library/CloudStorage/GoogleDrive-*/ -iname '*<name>*.pdf'` and copy it to the scratchpad
   before reading it (a file that is only "online" downloads on first read). A Drive link cannot be
   resolved to a path this way; ask for the file name instead.
2. **A Google Drive connector** (tools with `google_drive` or `drive` in their name, possibly
   deferred: search for them). Find the file by name or by the id in the link
   (`https://drive.google.com/file/d/<id>/...`). If the connector can download the file's bytes,
   save it to the scratchpad as a PDF and continue as usual. If it only returns the text, you can
   still fill every text field from it, but there are no images to extract: reuse existing logos by
   company name and tell the user which assignments are left without one, and tell them the CV is
   created without a photo.
3. **Neither available:** ask the user to download the PDF into the repo folder, or to install Google
   Drive for desktop or connect Google Drive in Claude's settings.

Never write back to Drive.

## Inserting a new CV

1. **Who and where.** `whoami`, `persons`, `list`. The CV belongs to the person behind the token
   unless the token is an admin and you pass `personId`. If the resume's person does not exist (common
   with dev data), do not guess: use the token's own person, and say so in the report. Use the `name`
   the user chose (see "Before you start") and check it does not collide with that person's CVs.
2. **Parse the resume.**
   ```
   cvapi.py parse resume.pdf "CV name" PERSON_UUID > form.json 2> notes.txt
   ```
   This writes a complete `CvForm` draft (name and personId are optional arguments; without them they
   are `null`) and, on stderr, the person's name on the resume plus a `note:` per thing to check. What
   the parser does, so you know what to verify:
   - **Text** comes from `pdftotext -layout`, with zero-width-space tab filler (`\u200b`, common in
     Google Docs exports) stripped and runs of 2+ spaces read as column breaks; page headers
     (`Curriculum Vitae - <name>`) and bare page numbers that repeat across pages are dropped. Wrapped
     paragraphs are rejoined by blank lines, so a paragraph break the PDF doesn't render as a blank
     line (rare, but it happens) can land in the wrong field \u2014 this is the main thing to double-check.
   - **Header** `Name/Place/Telephone/Date of Birth` (EN and NL labels) and the summary paragraphs.
   - **Assignments** start at each `Period` field; `Client`, `Role`, `Technologies` (also when the
     list wraps onto a short, non-sentence-like next line) and the description paragraphs follow. A
     paragraph cut by a page break is joined (noted).
   - **Employer**: `Flock - Aigentic` -> client `Aigentic`, employer `Flock`; `(via Capgemini)` in the
     client, role or description -> employer `Capgemini` (removed from the client); otherwise the
     overview table (`FLOCK - Bol.com`), also when one row covers several assignments at that client.
     Nothing found -> `null` (noted).
   - **Client city** (`Osiris, Amsterdam`) is dropped for known cities (noted); two companies
     (`Albert Heijn, PostNL`) stay.
   - **Dates**: `07-2025`, `July 2025`, `juli 2025`, `2024`, `now/present/heden`. Year-only dates get
     their month from the overview's month count (running: counted back from today; finished: from
     January), else January / December (noted as inferred).
   - **Lists**: `Technologies` -> `skills` (category `Technologies`, stars or `4/5` as level, else
     `null`, in reading order \u2014 a two-column grid is no longer reordered column-major, since that
     needs coordinates); `Skills` -> rated items to `skills`, unrated to `subjects` (duplicates
     dropped); `Education`, then `Training`/certifications under a `Training` heading; `Languages`
     lines as they are (`Dutch *****`). Sections without a field (Motivation, Hobbies) are dropped
     (noted). Technology names get standard spelling (`Springboot` -> `Spring Boot`, noted).
   - **Language** of the CV is `NL` when the headings/labels are Dutch, else `EN`.
   - **Logo hints**: per experience, the candidate images on that experience's *page* (`img-2-7.png`),
     and which experience's logo to reuse when an assignment at the same client has none. See "Logos"
     below — this is the part hit hardest by not having coordinates.
   - **Photo**: the largest non-decoration image on page 1 (the person's headshot, not a logo) is
     always pulled into `form["photo"]` as a data URL automatically — no separate step needed. A
     `note:` says so, or says why not (too small to be a headshot, or in a format (e.g. TIFF) the CV
     photo doesn't accept — add it by hand with `cvapi.py data-url` then). Look at the
     photo yourself (the hinted filename, via `extract-images`) before trusting it: a page-1 image
     that happens to be a large banner or decoration not caught by the repeat-page check would be
     wrongly picked up as the photo.
3. **Check the draft against the resume.** Run `cvapi.py text resume.pdf` (one paragraph or table row
   per line, ` | ` between cells) and read it all. Go through every `note:` and the form: role/client
   per assignment, paragraph counts of the descriptions, technologies, the inferred dates. Fix what is
   wrong directly in `form.json` (a few `Edit`s, or a small script for many). Templates differ per
   person; when a section is not recognised its text is missing from the form, so compare section by
   section. When the parser gets something structurally wrong, fix `cvtext.py` rather than working
   around it every time, and re-run `parse` on the resumes you have to check nothing else changed.
4. **Logos and photo.** See "Logos" below. Every experience with a logo hint gets a `logoId`. The
   photo is already in `form["photo"]` when `parse` found one — confirm it against the resume (Read
   the hinted image file) rather than trusting it blindly, same as a logo.
5. **Create**: `cvapi.py create form.json` prints `CODE NAME | person FIRST LAST` (not JSON). A 400
   names the offending field; a 409 is a name collision.
6. **Verify** with `cvapi.py get CODE > stored.json`: count of experiences and skills, every `logoId`
   set, and the stored summary and descriptions equal to those in `form.json`.

## Logos

1. `cvapi.py logos` first. Logo names are unique (409 on a duplicate), so **reuse** an existing logo
   for the same company (`bol.com`, `ING`, ...) instead of uploading again.
2. `cvapi.py extract-images file.pdf OUTDIR` runs poppler's `pdfimages -all -p`, writing every
   placed image as `img-<page>-<num>.png` (a JPEG stays `.jpg`) grouped by page. There is no
   per-image position anymore (poppler's plain extraction doesn't give one), so unlike before this
   can't merge a separate soft-mask into the alpha channel either — a logo with transparency may
   come out looking slightly different; check it still looks right. The file names match the logo
   hints of `parse`.
3. **Look at each hinted image** with the Read tool before uploading. How the hints are made, for when
   one looks wrong:
   - An image whose exact bytes repeat on 2+ pages is decoration (background, Flock header logo) and
     is already excluded from the hints. The same logo appearing twice *on one page* (e.g. two
     Bol.com assignments sharing that page) is not decoration — both images just happen to match.
   - A hint lists every non-decoration image on the assignment's page, not the one(s) actually next
     to it — there are no coordinates to narrow it down. When a page holds **only one** assignment
     this is usually unambiguous. When it holds more than one, `parse` adds an explicit note and you
     must look at the resume text yourself to tell which image belongs to which assignment.
   - The largest non-decoration image on page 1 is treated as the person's photo (already pulled
     into `form["photo"]` by `parse`, see above) and excluded from hints; a small logo-sized image
     there is not affected.
   - Small images (32x32, 53x56) are normal for client logos; they are still the right ones.
   - An experience holds **one** logo. When an assignment shows two (e.g. Albert Heijn and PostNL),
     use the first company's and tell the user the other one was not linked.
4. Upload new ones with `cvapi.py upload-logo "Name" path.png`. Accepted: PNG, JPEG, GIF, WebP, SVG,
   at most 512 KB. Name them after the company as it appears on the CV.

## Editing part of an existing CV

`PUT /api/cvs/{code}` replaces the **whole** CV; there is no partial update. So:

1. Find the CV: `cvapi.py list` (or `list PERSON_UUID`).
2. `cvapi.py get-form CODE > form.json`. This converts the stored CV into a CvForm and keeps
   `personId` and every `logoId`.
3. Change only what the user asked for in `form.json` (an assignment by its client and period, the
   summary, a skill level, adding a logo to an experience, ...). Leave everything else byte for byte.
4. `cvapi.py put CODE form.json`, then `get CODE` to confirm the change.

Pitfalls:
- **Always send `personId`** on a PUT. Without it an admin token moves the CV to the admin's own
  person. `get-form` includes it and `put` refuses a form without it.
- Leaving `experiences`, `skills` or a text field out of the form clears it. Leaving `photo` out
  keeps the person's photo (it belongs to the person, shared by all their CVs); send `"photo": ""`
  to remove it. `get-form` carries the existing `photo` forward, which is harmless.
- To **add or replace** the person's photo from an image file (not a PDF import), set
  `form["photo"]` to the output of `cvapi.py data-url path.png` before `put`.
- Every save creates a revision (`GET /api/cvs/{code}/revisions`), so a bad edit can be undone with
  `POST /api/cvs/{code}/revisions/{id}/restore`.
- Renaming a CV to a name its person already uses gives a 409.

## Adjusting a CV for a client request

Trigger: "Adjust the resume of `<person>` for the request of `<client name / file name / content>`" —
the person's experience, skills and summary get emphasized, reordered or rephrased to match what a
specific client or consultancy request is asking for. This never adds a skill or a piece of experience
the person doesn't actually have; it brings existing, truthful content to the front and into the
client's language.

1. **Find the client request.** The user may point to a file name, a client name, or paste the request
   text directly in the chat.
   - A **file** (PDF, doc, text) is looked up the same way a resume is (see "Getting the resume from
     Google Drive" above) — local path, Drive-for-desktop folder, or a Drive connector. A PDF is read
     with `cvapi.py text` or `pdftotext`.
   - A **client name only**, with no file and no pasted content, is not enough to locate the request:
     ask the user where to find it (a file name, or ask them to paste the relevant part of the request
     into the chat).
   - If the user's message is as bare as "I want to adjust the resume of X for a specific client
     request" (no file, no client name, no content), stop and ask in a plain message for one of: a file
     name, the client's name (so you can search for a request already on disk/Drive by that name), or
     the request pasted into the chat. Do not guess or proceed on an assumed client.
2. **Extract requirements** from the request: required skills/technologies, years of experience, domain
   knowledge, soft/cultural fit (team style, values, methodology), language, and anything else explicitly
   asked for. If the request is vague or you can't tell what should drive the rewrite, ask the user
   before editing rather than guessing.
3. **Find the person's CV(s)**: `cvapi.py list PERSON_UUID`. If the person has more than one CV, ask
   which one to adjust. If none exists yet, say so — this flow edits an existing CV, it doesn't create
   one from scratch.
4. **Decide in place vs. a new variant.** Ask the user (unless already specified) whether to:
   - edit the named CV in place, or
   - create a copy for this client (`<Full name> - <Client>`, per the naming rule in "Before you start")
     and leave the original untouched — usually the safer default when the source CV is their "General"
     CV or already used elsewhere.
5. **Apply the adjustment** with the normal edit flow (`get-form` -> edit `form.json` -> `put` -> `get`
   to confirm, or `create` for a new variant):
   - **Summary**: lead with the experience and strengths that match the request.
   - **Skills**: reorder so the requested technologies/skills come first within their category; do not
     invent a skill or bump its `level` beyond what the CV already states.
   - **Experiences**: rephrase descriptions to surface relevant technologies, responsibilities or
     outcomes already present in the text, and reorder `technologies` lists the same way as skills.
     Reword, don't rewrite history — role, client, employer and dates stay exactly as they were.
   - Keep every change traceable to something that was already true on the CV.
6. **Report back**: which requirements from the client request drove which change (summary, skills,
   per-experience), and call out any requirement the person's existing CV doesn't support — surface the
   gap, don't paper over it by fabricating content.

## Report back

Tell the user: the CV's name, code and the person it belongs to (and why, if it is not the resume's
owner); per field what went in; which logos were reused, which uploaded and which were not linked;
whether a photo was found and added (or why not, if the resume had a page-1 photo that couldn't be
used); any inferred dates or normalisations you made; and which data in the resume had no field
(date of birth, e-mail, motivation, ...). For an edit, say exactly what changed.
