"""Reset the demo spreadsheet and check Google Sheets + Dograh. Called by demo-reset.sh.

Reads n8n's decrypted credentials (JSON) on stdin so no secret is stored or printed.
Usage: python3 demo_reset.py reset|check <backup_dir>
"""
import datetime
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

SHEET_ID = "YOUR_GOOGLE_SHEET_ID"
DOGRAH_WORKFLOW_ID = 12967
HISTORY_TABS = ["Call_Attempts", "Feedback", "Follow_Up_Tasks", "Errors"]
PHONE = "+91XXXXXXXXXX"
QUEUE = [
    ["DEMO-1001", "CUST-D01", "Rohan Singh", PHONE, "Oud Royale", "2026-10-01", "2026-10-04", "Yes", "2026-10-10 10:00:00", "Hold", "0", ""],
    ["DEMO-1002", "CUST-D02", "Priya Sharma", PHONE, "Velvet Rose", "2026-10-02", "2026-10-05", "Yes", "2026-10-10 10:00:00", "Hold", "0", ""],
    ["DEMO-1003", "CUST-D03", "Arjun Mehta", PHONE, "Amber Nights", "2026-10-03", "2026-10-06", "Yes", "2026-10-10 10:00:00", "Hold", "0", ""],
    ["DEMO-1004", "CUST-D04", "Neha Kapoor", PHONE, "Citrus Bloom", "2026-10-03", "2026-10-06", "No", "2026-10-10 10:00:00", "Pending", "0", ""],
]

mode = sys.argv[1] if len(sys.argv) > 1 else "check"
backup_dir = sys.argv[2] if len(sys.argv) > 2 else "/var/backups/voice-agent"
creds = json.load(sys.stdin)
failures = 0


def ok(msg):
    print("  [OK] " + msg)


def bad(msg):
    global failures
    failures += 1
    print("  [!!] " + msg)


def http(method, url, headers, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as r:
        raw = r.read()
        return json.loads(raw) if raw[:1] in (b"{", b"[") else {}


def cred(name=None, ctype=None):
    for c in creds:
        if (name and c["name"] == name) or (ctype and c["type"] == ctype):
            return c["data"]
    raise KeyError(name or ctype)


# --- Google Sheets -----------------------------------------------------------
g = cred(ctype="googleSheetsOAuth2Api")
try:
    token_body = urllib.parse.urlencode({
        "client_id": g["clientId"], "client_secret": g["clientSecret"],
        "refresh_token": g["oauthTokenData"]["refresh_token"], "grant_type": "refresh_token"}).encode()
    at = json.load(urllib.request.urlopen("https://oauth2.googleapis.com/token", token_body, timeout=30))["access_token"]
    ok("Google login works (n8n's Google Sheets credential)")
except Exception as e:
    bad("Google login failed: %s. Reconnect 'Google Sheets account' in n8n." % e)
    sys.exit(1)

H = {"Authorization": "Bearer " + at, "Content-Type": "application/json"}
BASE = "https://sheets.googleapis.com/v4/spreadsheets/" + SHEET_ID


def values(tab):
    return http("GET", BASE + "/values/" + urllib.parse.quote(tab), H).get("values", [])


if mode == "reset":
    snapshot = {tab: values(tab) for tab in ["Outreach_Queue"] + HISTORY_TABS}
    stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    path = os.path.join(backup_dir, "demo-sheet-before-reset-%s.json" % stamp)
    with open(path, "w") as f:
        json.dump(snapshot, f, indent=1)
    os.chmod(path, 0o600)
    cleared = {tab: max(len(rows) - 1, 0) for tab, rows in snapshot.items() if tab in HISTORY_TABS}

    http("POST", BASE + "/values:batchClear", H,
         {"ranges": ["Outreach_Queue!A2:Z1000"] + ["%s!A2:Z5000" % t for t in HISTORY_TABS]})
    http("PUT", BASE + "/values/Outreach_Queue!A2:L5?valueInputOption=RAW", H, {"values": QUEUE})
    ok("old sheet contents saved to " + path)
    ok("history tabs emptied (headers kept): " + ", ".join("%s %d rows" % (t, n) for t, n in cleared.items()))
    ok("Outreach_Queue back to the 4 demo rows")

queue = values("Outreach_Queue")[1:]
print("       Outreach_Queue now:")
for row in queue:
    row = row + [""] * (12 - len(row))
    print("         %-10s %-13s permission=%-3s status=%-9s attempts=%s" % (row[0], row[2], row[7], row[9], row[10]))
history = {t: max(len(values(t)) - 1, 0) for t in HISTORY_TABS}
print("       History rows: " + ", ".join("%s %d" % (t, n) for t, n in history.items()))
dialable = [r[0] for r in queue if len(r) > 9 and r[7] == "Yes" and r[9] == "Pending"]
if dialable:
    print("       NOTE: %s would be dialed within a minute (Pending + permission Yes)." % ", ".join(dialable))

# --- Dograh ------------------------------------------------------------------
try:
    key = cred(name="Header Auth account")["value"]
    wf = http("GET", "https://api.dograh.com/api/v1/workflow/fetch/%d" % DOGRAH_WORKFLOW_ID,
              {"X-API-Key": key, "Accept": "application/json"})
    status = wf.get("version_status")
    msg = "Dograh agent '%s': version %s, %s" % (wf.get("name"), wf.get("version_number"), status)
    ok(msg) if status == "published" else bad(msg + " (open Dograh and click Publish)")
except urllib.error.HTTPError as e:
    bad("Dograh API returned %d (API key revoked or agent deleted?)" % e.code)
except Exception as e:
    bad("Dograh check failed: %s" % e)

sys.exit(1 if failures else 0)
