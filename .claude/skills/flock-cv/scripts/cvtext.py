"""Read a resume PDF via poppler's CLI tools (pdftotext, pdfimages) instead of a custom PDF engine.

Used by cvapi.py:
  text PDF                    the text in reading order, one paragraph (or table row) per line
  parse PDF                   a CvForm draft parsed from the Flock template, notes on stderr
  extract-images PDF OUTDIR   every image as PNG/JPEG/TIFF (poppler's "-all" mode)

Needs `pdftotext` and `pdfimages` (poppler-utils) on PATH. SKILL.md has the install check Claude
should run before calling this; require_poppler() is a safety net if that check was skipped.

Without the old custom renderer there is no access to text/image coordinates, so this module cannot
match logos to assignments by position, detect bold text, or reorder multi-column grids by column.
Those degrade to page- and order-based heuristics (see compute_logo_hints and split_items) and need
more manual verification than before, especially on a page that holds more than one assignment.
"""

import datetime
import hashlib
import os
import re
import shutil
import subprocess
import sys
import tempfile

# ---------------------------------------------------------------------------------------------
# poppler wrappers


def require_poppler():
    missing = [b for b in ("pdftotext", "pdfimages") if shutil.which(b) is None]
    if missing:
        sys.exit(
            "missing required tool(s): " + ", ".join(missing) + " (poppler-utils). "
            "Check with `which pdftotext pdfimages` before running this skill; if either is "
            "missing, ask the user for permission (y/n) to install poppler, e.g. "
            "`brew install poppler` on macOS or `apt-get install poppler-utils` on Debian/Ubuntu, "
            "then retry."
        )


def run_pdftotext(pdf_path):
    require_poppler()
    try:
        proc = subprocess.run(
            ["pdftotext", "-layout", "-enc", "UTF-8", pdf_path, "-"],
            check=True, capture_output=True, text=True, encoding="utf-8",
        )
    except subprocess.CalledProcessError as e:
        raise ValueError(f"pdftotext failed: {e.stderr.strip()}")
    return proc.stdout


def extract_all_images(pdf_path, outdir):
    """Write every image via `pdfimages -all -p` (JPEGs stay .jpg, most others become .png/.tiff).
    Returns [(page, num, filename)] sorted by (page, num). Filenames follow poppler's -p naming,
    `img-<page>-<num>.<ext>`, which is deterministic for a given PDF, so a later call (e.g. from
    `parse`'s logo-hint scratch extraction) names the same image the same way."""
    require_poppler()
    os.makedirs(outdir, exist_ok=True)
    root = os.path.join(outdir, "img")
    try:
        subprocess.run(["pdfimages", "-all", "-p", pdf_path, root],
                        check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as e:
        raise ValueError(f"pdfimages failed: {e.stderr.strip()}")
    pat = re.compile(r"^img-(\d+)-(\d+)\.(\w+)$")
    out = []
    for name in sorted(os.listdir(outdir)):
        m = pat.match(name)
        if m:
            out.append((int(m.group(1)), int(m.group(2)), name))
    out.sort()
    return out


# ---------------------------------------------------------------------------------------------
# Text helpers (pure string processing, no PDF geometry needed)


def clean(text):
    text = text.replace("​", "\t").replace(" ", " ").replace("﻿", "")
    text = re.sub(r"[ ]*\t[\t ]*", "\t", text)
    text = re.sub(r" {2,}", " ", text)
    return text.strip(" \t")


def join_lines(lines):
    out = ""
    for line in lines:
        if not out:
            out = line
        elif out.endswith((" ", "\t")) or line.startswith((" ", "\t")):
            out += line
        elif re.search(r"\w-$", out):
            out += line
        else:
            out += " " + line
    return clean(out)


SECTIONS = {
    "overview": {"work experience", "werkervaring", "experience", "overview", "werkervaring overzicht"},
    "education": {"education", "opleiding", "opleidingen"},
    "training": {"training", "trainingen", "certifications", "certificaten", "certificeringen", "courses",
                 "cursussen", "training and certifications", "trainingen en certificeringen"},
    "technologies": {"technologies", "technologieën", "technologieen", "technical skills", "tools"},
    "skills": {"skills", "vaardigheden", "competences", "competenties", "kennis"},
    "languages": {"languages", "talen"},
    "ignored": {"motivation", "motivatie", "hobbies", "hobby's", "interests", "interesses", "references",
                "referenties", "personal", "persoonlijk"},
}
NL_HINTS = {"werkervaring", "opleiding", "opleidingen", "talen", "vaardigheden", "motivatie", "periode", "klant",
            "rol", "woonplaats", "geboortedatum"}
LABELS = {
    "name": ["name", "naam"],
    "place": ["place", "woonplaats", "plaats", "residence", "location", "locatie"],
    "phone": ["telephone", "phone", "telefoon", "telefoonnummer", "tel", "mobile", "mobiel"],
    "birth": ["date of birth", "geboortedatum", "born", "geboren"],
    "email": ["e-mail", "email"],
    "period": ["period", "periode"],
    "client": ["client", "klant", "opdrachtgever", "company", "bedrijf"],
    "employer": ["employer", "werkgever"],
    "role": ["role", "rol", "functie", "position", "job title"],
    "technologies": ["technologies", "technologieën", "technologieen", "techniques", "technieken", "tools"],
}
LABEL_OF = {alias: key for key, aliases in LABELS.items() for alias in aliases}
MONTHS = {
    "jan": 1, "january": 1, "januari": 1, "feb": 2, "february": 2, "februari": 2, "mar": 3, "march": 3,
    "maart": 3, "mrt": 3, "apr": 4, "april": 4, "may": 5, "mei": 5, "jun": 6, "june": 6, "juni": 6,
    "jul": 7, "july": 7, "juli": 7, "aug": 8, "august": 8, "augustus": 8, "sep": 9, "sept": 9,
    "september": 9, "oct": 10, "october": 10, "okt": 10, "oktober": 10, "nov": 11, "november": 11,
    "dec": 12, "december": 12,
}
NOW = {"now", "present", "current", "today", "heden", "nu", "huidig", "ongoing", "date"}
CITIES = {
    "amsterdam", "rotterdam", "utrecht", "den haag", "the hague", "'s-gravenhage", "eindhoven", "amersfoort",
    "hilversum", "groningen", "leiden", "delft", "haarlem", "arnhem", "nijmegen", "zwolle", "breda", "tilburg",
    "almere", "apeldoorn", "enschede", "den bosch", "'s-hertogenbosch", "maastricht", "schiphol", "diemen",
    "amstelveen", "zeist", "nieuwegein", "houten", "hoofddorp", "leeuwarden", "deventer", "veenendaal",
    "ede", "wageningen", "alkmaar", "zaandam", "dordrecht", "gouda", "the netherlands", "nederland",
    "remote", "london", "berlin", "brussels", "brussel", "antwerp", "antwerpen",
}
TECH_NAMES = {
    "springboot": "Spring Boot", "spring-boot": "Spring Boot", "pytorch": "PyTorch", "tensorflow": "TensorFlow",
    "typescript": "TypeScript", "javascript": "JavaScript", "matlab": "MATLAB", "openapi": "OpenAPI",
    "c (#)": "C#", "c(#)": "C#", "c sharp": "C#", "node/js": "Node.js", "nodejs": "Node.js", "node": "Node.js",
    "latex": "LaTeX", "graphql": "GraphQL", "postgres": "PostgreSQL", "postgresql": "PostgreSQL",
    "mysql": "MySQL", "mongodb": "MongoDB", "github": "GitHub", "gitlab": "GitLab", "github actions": "GitHub Actions",
    "kotlin": "Kotlin", "java": "Java", "python": "Python", "react": "React", "angular": "Angular",
    "terraform": "Terraform", "kubernetes": "Kubernetes", "docker": "Docker", "gradle": "Gradle",
    "maven": "Maven", "playwright": "Playwright", "wirespec": "Wirespec", "kafka": "Kafka", "scala": "Scala",
    "css": "CSS", "html": "HTML", "sql": "SQL", "aws": "AWS", "gcp": "GCP", "azure": "Azure",
    "google cloud platform": "Google Cloud Platform", "bigquery": "BigQuery", "vue": "Vue", "vuejs": "Vue",
    "next.js": "Next.js", "nextjs": "Next.js", "jquery": "jQuery", "ios": "iOS", "kotlin multiplatform": "Kotlin Multiplatform",
}
BULLET = re.compile(r"^[\s·⋅•‣▪◦●○■□⁃∙\-–*]+\s*")
STARS = re.compile(r"\s*([*★☆⭐]{1,5}|\(?([1-5])\s*/\s*5\)?)\s*$")
CVHEADER_RE = re.compile(r"^(curriculum vitae|cv)\s*[-–:]\s*(.+)$", re.I)
PAGENUM_RE = re.compile(r"^(page|pagina)?\s*\d{1,3}(\s*(/|of|van)\s*\d{1,3})?$", re.I)


def stars(m):
    if m.group(2):
        return int(m.group(2))
    return len(re.findall(r"[*★⭐]", m.group(1))) or None


def norm_tech(name, notes):
    stripped = name.strip().strip(".")
    fixed = TECH_NAMES.get(stripped.lower())
    if fixed and fixed != stripped and stripped.lower() not in ("node",):
        notes.add(f"normalised technology {stripped!r} -> {fixed!r}")
        return fixed
    return stripped


def section_of(text):
    """The section a standalone heading paragraph starts, or None. A row with cells (tab-joined,
    see cells_of) is never a bare heading."""
    if "\t" in text:
        return None
    key = text.strip().rstrip(":").lower()
    for name, words in SECTIONS.items():
        if key in words:
            return name
    return None


def split_label(text):
    """(label key, value) when text is a 'Label: value' field or a 'Label<TAB>value' row, else
    (None, None). A tab here always means a separate cell (see cells_of), never part of a word."""
    if "\t" in text:
        first, rest = text.split("\t", 1)
        key = first.strip().rstrip(":").lower()
        if key in LABEL_OF:
            return LABEL_OF[key], clean(rest.replace("\t", " "))
        return None, None
    m = re.match(r"^\s*([^:]{2,30}?):\s*(\S.*)$", text)
    if m and m.group(1).strip().lower() in LABEL_OF:
        return LABEL_OF[m.group(1).strip().lower()], clean(m.group(2))
    bare = text.strip().rstrip(":").strip().lower()
    if bare in LABEL_OF:
        return LABEL_OF[bare], ""
    return None, None


def field(text):
    """split_label, except that a Period without a year (the overview table's header) is no field."""
    label, value = split_label(text)
    if label == "period" and not re.search(r"\d{4}", value or ""):
        return None, None
    return label, value


def parse_period(text):
    points = []
    pat = re.compile(
        r"(?P<m1>\d{1,2})[-/.](?P<y1>\d{4})"
        r"|(?P<mn>[A-Za-z]{3,9})\.?\s+(?P<y2>\d{4})"
        r"|(?P<y3>\d{4})(?:[-/.](?P<m3>\d{1,2})(?!\d))?"
        r"|(?P<now>[A-Za-z]+)", re.I)
    for m in pat.finditer(text):
        if m.group("y1"):
            points.append((int(m.group("y1")), int(m.group("m1"))))
        elif m.group("y2") and m.group("mn").lower() in MONTHS:
            points.append((int(m.group("y2")), MONTHS[m.group("mn").lower()]))
        elif m.group("y3"):
            points.append((int(m.group("y3")), int(m.group("m3")) if m.group("m3") else None))
        elif m.group("now") and m.group("now").lower() in NOW:
            points.append("now")
    return points


def add_months(y, m, n):
    t = y * 12 + (m - 1) + n
    return t // 12, t % 12 + 1


def ym(y, m):
    return f"{y:04d}-{m:02d}"


def resolve_dates(text, months, notes, label):
    pts = parse_period(text)
    today = datetime.date.today()
    if not pts or pts[0] == "now":
        notes.add(f"{label}: could not read period {text!r}; set from/to by hand")
        return None, None
    (y1, m1) = pts[0]
    end = pts[1] if len(pts) > 1 else None
    inferred = False
    if m1 is None:
        inferred = True
        m1 = 1
        if end == "now" and months:
            y, m = add_months(today.year, today.month, -months)
            if y == y1:
                m1 = m
    frm = ym(y1, m1)
    if end is None:
        notes.add(f"{label}: period {text!r} has no end; assumed it is still running")
        to = None
    elif end == "now":
        to = None
    else:
        y2, m2 = end
        if m2 is None:
            inferred = True
            if months:
                y, m = add_months(y1, m1, months)
                m2 = m if y == y2 else 12
            else:
                m2 = 12
        to = ym(y2, m2)
    if inferred:
        notes.add(f"{label}: period {text!r} has no months; inferred {frm} - {to or 'now'}"
                  + (f" from the {months} months in the overview" if months else ""))
    return frm, to


def split_items(texts):
    """List items from a section's entry texts, in document order. Each tab-joined cell (see
    cells_of) becomes its own item; there is no column-major grid reordering without coordinates."""
    out = []
    for t in texts:
        for cell_text in t.split("\t"):
            item = clean(BULLET.sub("", cell_text).replace("\t", " "))
            if item:
                out.append(item)
    return out


# ---------------------------------------------------------------------------------------------
# Plain-text layout -> entries (paragraphs / table rows)


def cells_of(line):
    """A layout line split on runs of 2+ spaces, tab-joined; None for a blank line.

    Some exports (Google Docs) pepper the text with zero-width spaces as invisible tab-stop
    filler; pdftotext keeps them verbatim even though they render as nothing, so they are
    stripped here before splitting -- otherwise they survive .strip() (str.isspace() is False
    for U+200B) and turn into bogus empty cells."""
    s = line.replace("​", "").replace("﻿", "").rstrip("\n")
    if not s.strip():
        return None
    parts = [c.strip() for c in re.split(r" {2,}", s.strip()) if c.strip()]
    return "\t".join(parts) if parts else None


def strip_boilerplate(pages_lines):
    """Drops lines that repeat on 2+ pages (running headers/footers) and bare page numbers.
    Returns (cleaned pages_lines, the set of repeated lines) -- the repeated set is kept so the
    person's name can still be read from a 'Curriculum Vitae - NAME' header before it is dropped."""
    freq = {}
    for lines in pages_lines:
        for s in {ln.strip() for ln in lines if ln.strip()}:
            if len(s) < 120:
                freq[s] = freq.get(s, 0) + 1
    repeated = {s for s, n in freq.items() if n >= 2} if len(pages_lines) > 1 else set()
    out = []
    for lines in pages_lines:
        keep = []
        for ln in lines:
            s = ln.strip()
            if s and (s in repeated or PAGENUM_RE.match(s)):
                continue
            keep.append(ln)
        out.append(keep)
    return out, repeated


def build_entries(pdf_path):
    """[(page, text)] in reading order: wrapped prose joined into one paragraph entry, while a
    labelled field, a table row (has a tab) or a section heading each stand alone, like the old
    renderer's paragraphs -- just split on text shape (blank lines, labels, headings) instead of
    font/position, since poppler's plain text has no coordinates."""
    raw = run_pdftotext(pdf_path)
    pages_lines = [p.split("\n") for p in raw.split("\f")]
    while pages_lines and not any(l.strip() for l in pages_lines[-1]):
        pages_lines.pop()
    pages_lines, repeated = strip_boilerplate(pages_lines)
    entries = []
    for page_no, lines in enumerate(pages_lines, 1):
        buf = []

        def flush():
            if buf:
                entries.append((page_no, join_lines(buf)))
                del buf[:]

        for raw_line in lines:
            cell_text = cells_of(raw_line)
            if cell_text is None:
                flush()
                continue
            if "\t" in cell_text or split_label(cell_text)[0] is not None or section_of(cell_text):
                flush()
                entries.append((page_no, cell_text))
                continue
            buf.append(cell_text)
        flush()
    return entries, repeated


def render_text(pdf_path):
    entries, _ = build_entries(pdf_path)
    out, page = [], None
    for p, text in entries:
        if p != page:
            page = p
            out.append(f"\n=== page {page} ===")
        out.append(text.replace("\t", " | "))
    return "\n".join(out).strip() + "\n"


# ---------------------------------------------------------------------------------------------
# Logo hints (page- and content-based, no placement coordinates)


def compute_logo_hints(pdf_path, exps, notes):
    """[[filename, ...], ...] aligned with exps: candidate logo images per experience's page.
    Decoration (header logo, background) is detected by the same image bytes repeating across
    pages, and a page-1 photo by being the largest non-decoration image there -- coarser than the
    old box-proximity match, and unable to split several assignments sharing one page, so every
    hint still needs a manual look (see SKILL.md)."""
    with tempfile.TemporaryDirectory() as tmp:
        imgs = extract_all_images(pdf_path, tmp)
        info = []
        for page, num, name in imgs:
            with open(os.path.join(tmp, name), "rb") as f:
                data = f.read()
            info.append({"page": page, "name": name, "size": len(data), "hash": hashlib.sha1(data).hexdigest()})

    by_hash = {}
    for it in info:
        by_hash.setdefault(it["hash"], set()).add(it["page"])
    decoration = {h for h, pages in by_hash.items() if len(pages) >= 2}

    page1 = [it for it in info if it["page"] == 1 and it["hash"] not in decoration]
    photo = max(page1, key=lambda it: it["size"]) if page1 else None
    if photo and photo["size"] < 8000:
        photo = None  # too small to be a headshot; treat as a logo candidate instead

    by_page = {}
    for it in info:
        if it["hash"] in decoration or (photo and it["name"] == photo["name"]):
            continue
        by_page.setdefault(it["page"], []).append(it["name"])

    exps_per_page = {}
    for e in exps:
        exps_per_page[e["page"]] = exps_per_page.get(e["page"], 0) + 1

    hints = []
    for e in exps:
        cands = by_page.get(e["page"], [])
        hints.append(cands)
        if cands and exps_per_page.get(e["page"], 0) > 1:
            notes.add(f"page {e['page']}: {exps_per_page[e['page']]} assignments share logo image(s) "
                      f"{', '.join(cands)} on that page; without placement coordinates, matching each "
                      f"image to the right assignment needs a manual check")
    if photo:
        notes.add(f"page 1 has a photo ({photo['name']}); the CV has no field for it")
    return hints


# ---------------------------------------------------------------------------------------------
# Resume parser (Flock template, EN and NL)


def parse_resume(pdf_path, notes):
    entries, repeated = build_entries(pdf_path)

    header, summary, overview, exps = {}, [], [], []
    lists = {k: [] for k in ("education", "training", "technologies", "skills", "languages")}
    ignored, section, exp = [], "header", None

    for page, text in entries:
        sec = section_of(text)
        if sec:
            section, exp = sec, None
            if sec == "ignored":
                ignored.append(text)
            continue
        label, value = field(text)
        if label == "period":
            exp = {"period": value, "fields": {}, "desc": [], "page": page, "last": None}
            exps.append(exp)
            section = "experience"
            continue
        if section == "experience" and exp is not None:
            if label in ("client", "employer", "role", "technologies") and not exp["desc"]:
                if label == "technologies" and exp["fields"].get("technologies"):
                    exp["fields"]["technologies"] += ", " + value
                else:
                    exp["fields"][label] = value
                exp["last"] = label
            elif (exp["last"] == "technologies" and not exp["desc"] and len(text) < 100
                  and not re.search(r"[.!?]\s+[A-Z]", text) and not re.search(r"[.!?]\s*$", text)):
                # a wrapped technology list continuing without its own label (no indentation info
                # without coordinates, so this is judged by shape: short, and not sentence-like).
                # Kept strict: build_entries sometimes fails to put a paragraph break between this
                # and the description that follows it (no blank line in the pdftotext output), and
                # a looser rule here would swallow the whole description into "technologies".
                exp["fields"]["technologies"] = (
                    exp["fields"].get("technologies", "").rstrip(", ") + ", " + text).strip(", ")
            else:
                exp["desc"].append((page, text))
            continue
        if section == "header":
            if label in ("name", "place", "phone", "birth", "email"):
                header[label] = value
            elif not re.match(r"(curriculum vitae|cv)\b", text, re.I):
                summary.append(text)
            continue
        if section == "overview":
            overview.append(text)
        elif section in lists:
            lists[section].append(text)
        elif section == "ignored":
            ignored.append(text)

    # language of the CV
    words = set()
    for _, text in entries:
        words.add(text.strip().rstrip(":").lower())
        words.add(text.split("\t", 1)[0].split(":", 1)[0].strip().lower())
    language = "NL" if words & NL_HINTS else "EN"

    # overview table
    ov_rows = [text.split("\t") for text in overview]
    cols = {"period": 0, "role": 1, "months": 2, "client": 3}
    if ov_rows and any(c.lower() in ("period", "periode") for c in ov_rows[0]):
        head = [c.lower() for c in ov_rows.pop(0)]
        for i, c in enumerate(head):
            if c in ("period", "periode"):
                cols["period"] = i
            elif "month" in c or "maand" in c:
                cols["months"] = i
            elif "client" in c or "klant" in c or "company" in c or "opdrachtgever" in c:
                cols["client"] = i
            elif "title" in c or "role" in c or "functie" in c or "rol" == c:
                cols["role"] = i

    def cell(r, k):
        return r[cols[k]] if cols[k] < len(r) else ""

    def overview_row(e, i):
        start = parse_period(e["period"])
        y = start[0][0] if start and start[0] != "now" else None
        client = (e["fields"].get("client") or "").lower()
        for r in ov_rows:
            rp = parse_period(cell(r, "period"))
            ry = rp[0][0] if rp and rp[0] != "now" else None
            rc = cell(r, "client").lower()
            if ry == y and client and (client in rc or rc in client or rc.split(" - ")[-1] in client):
                return r
        if start and start[0] != "now" and client:
            begin = (start[0][0], start[0][1] or 1)
            for r in ov_rows:
                rp = parse_period(cell(r, "period"))
                rc = cell(r, "client").lower()
                if not rp or rp[0] == "now" or not (client.split(",")[0] in rc or rc.split(" - ")[-1] in client):
                    continue
                lo = (rp[0][0], rp[0][1] or 1)
                hi = rp[1] if len(rp) > 1 else "now"
                hi = (9999, 12) if hi == "now" else (hi[0], hi[1] or 12)
                if lo <= begin <= hi:
                    return r
        return ov_rows[i] if len(ov_rows) == len(exps) else None

    # experiences
    experiences = []
    for i, e in enumerate(exps):
        f = e["fields"]
        label = f"experience {i + 1} ({f.get('client') or '?'})"
        row = overview_row(e, i)
        months = None

        def start_year(text):
            pts = parse_period(text)
            return pts[0][0] if pts and pts[0] != "now" else None

        period_text = e["period"]
        if row and start_year(cell(row, "period")) == start_year(e["period"]):
            m = re.search(r"\d+", cell(row, "months"))
            months = int(m.group()) if m else None
            ov_period = cell(row, "period")
            ov_pts, own_pts = parse_period(ov_period), parse_period(e["period"])
            if (ov_pts and own_pts and own_pts[0][1] is None and ov_pts[0][1] is not None
                    and (len(own_pts) < 2 or own_pts[1] == "now"
                         or (len(ov_pts) > 1 and ov_pts[1] != "now" and ov_pts[1][1] is not None))):
                notes.add(f"{label}: period {e['period']!r} has no months; using the overview's {ov_period!r} instead")
                period_text = ov_period
        frm, to = resolve_dates(period_text, months, notes, label)
        client = f.get("client") or ""
        employer = f.get("employer") or None
        m = re.search(r"\s*\(\s*via\s+([^)]+?)\.?\s*\)\.?", client, re.I)
        if m:
            employer = employer or m.group(1).strip()
            client = (client[: m.start()] + client[m.end():]).strip()
        m = re.match(r"^(.+?)\s+[-–]\s+(.+)$", client)
        if m and m.group(1).strip().lower() == "flock":
            employer, client = "Flock", m.group(2).strip()
        parts = [s.strip() for s in client.split(",")]
        while len(parts) > 1 and parts[-1].lower() in CITIES:
            notes.add(f"{label}: dropped the city {parts[-1]!r} from the client")
            parts = parts[:-1]
        client = ", ".join(parts)
        if not employer and row:
            rc = cell(row, "client")
            m = re.match(r"^(.+?)\s+[-–]\s+(.+)$", rc)
            if m and m.group(2).strip().lower().startswith(client.lower()[:4]):
                employer = m.group(1).strip()
                employer = employer.title() if employer.isupper() and len(employer) > 3 else employer
        if not employer:
            for t in [f.get("client") or "", f.get("role") or ""] + [t for _, t in e["desc"][:2]]:
                m = re.search(r"\(?\bvia\s+([A-Z][\w&.\- ]{1,40}?)[.)]*(?:\)|$|,|\s-)", t)
                if m:
                    employer = m.group(1).strip().rstrip(".")
                    break
        if not employer:
            notes.add(f"{label}: no employer found in the resume; left empty")
        techs, seen = [], set()
        for t in re.split(r"[,;]", f.get("technologies") or ""):
            t = norm_tech(clean(t.replace("\t", " ")), notes)
            if t and t.lower() not in seen:
                seen.add(t.lower())
                techs.append(t)
        desc = []
        for page, text in e["desc"]:
            if desc and desc[-1][0] != page and (not re.search(r"[.!?:\"')]$", desc[-1][1]) or text[:1].islower()):
                desc[-1] = (page, desc[-1][1] + " " + text)
                notes.add(f"{label}: joined a paragraph split by a page break")
            else:
                desc.append((page, text))
        role = (f.get("role") or "").strip()
        if not role or not client:
            notes.add(f"{label}: role or client missing; fill it in before creating the CV")
        experiences.append({"from": frm, "to": to, "role": role[:255], "client": client[:255],
                             "employer": employer, "technologies": techs,
                             "description": "\n\n".join(t.replace("\t", " ") for _, t in desc) or None,
                             "logoId": None})

    logo_hints = compute_logo_hints(pdf_path, exps, notes)
    for i, hint in enumerate(logo_hints):
        client = experiences[i]["client"]
        same = [j + 1 for j, h in enumerate(logo_hints) if h and j != i and experiences[j]["client"].lower() == client.lower()]
        if not hint and same:
            notes.add(f"experience {i + 1} ({client}): no logo image on that page; reuse the logo of experience {same[0]} (same client)")
        elif hint:
            notes.add(f"experience {i + 1} ({client}): logo image(s) on that page: {', '.join(hint)}"
                      + ("; an experience holds one logo" if len(hint) > 1 else ""))
        else:
            notes.add(f"experience {i + 1} ({client}): no logo image found on that page")

    # lists
    skills, subjects, seen = [], [], set()
    for t in split_items(lists["technologies"]):
        cm = re.match(r"^([A-Za-z][A-Za-z &/]{1,30}):\s*(.+,.+)$", t)
        if cm:
            category, items = cm.group(1).strip(), cm.group(2)
            notes.add(f"technologies: split {category!r} line into individual skills")
        else:
            category, items = "Technologies", t
        for item in (items.split(",") if cm else [items]):
            item = item.strip()
            if not item:
                continue
            m = STARS.search(item)
            level = stars(m) if m else None
            name = norm_tech(STARS.sub("", item) if m else item, notes)
            if name.lower() not in seen:
                seen.add(name.lower())
                skills.append({"category": category, "name": name[:255], "level": level})
    for t in split_items(lists["skills"]):
        m = STARS.search(t)
        if m:
            level = stars(m)
            name = norm_tech(STARS.sub("", t), notes)
            if name.lower() not in seen:
                seen.add(name.lower())
                skills.append({"category": "Technologies", "name": name[:255], "level": level})
        elif t.lower() not in {s.lower() for s in subjects}:
            subjects.append(t)
        else:
            notes.add(f"dropped duplicate subject {t!r}")
    education = split_items(lists["education"])
    training = split_items(lists["training"])
    if training:
        education += ["", "Training"] + training
    languages = split_items(lists["languages"])

    full_name = header.get("name")
    if not full_name:
        for s in repeated:
            m = CVHEADER_RE.match(s)
            if m:
                full_name = m.group(2).strip()
                break
    if header.get("birth"):
        notes.add(f"date of birth {header['birth']!r} has no field on the CV (it belongs on the person)")
    if header.get("email"):
        notes.add(f"e-mail {header['email']!r} has no field on the CV")
    if ov_rows:
        notes.add("the work-experience overview table is not stored (the CV builds its own)")
    if ignored:
        notes.add(f"left out section(s) without a field: {', '.join(sorted(set(ignored[:1])))}")

    form = {
        "personId": None,
        "name": None,
        "language": language,
        "place": header.get("place") or None,
        "phone": header.get("phone") or None,
        "summary": "\n\n".join(t.replace("\t", " ") for t in summary) or None,
        "experiences": experiences,
        "skills": skills,
        "education": "\n".join(education) or None,
        "subjects": "\n".join(subjects) or None,
        "languages": "\n".join(languages) or None,
    }
    return form, full_name, logo_hints
