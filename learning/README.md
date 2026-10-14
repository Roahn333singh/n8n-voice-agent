# Learning notes

Concepts learned while building the n8n + Dograh voice agent. Each folder is one topic with a
plain-English explanation, diagrams, and a checklist for next time.

| Topic | What you will learn |
|---|---|
| [webhook-auth](webhook-auth/README.md) | API calls vs webhooks, API keys vs webhook secrets, Bearer tokens, n8n Header Auth, status codes, how the 403 bug of 9 Oct 2026 was found and fixed |
| [backups](backups/README.md) | The 3 safety nets (nightly file, Google snapshots, restore points) + the encryption key, which one saves you when, how to restore, the restore drill, monthly check |
| [ssh-keys](ssh-keys/README.md) | Private vs public keys (key and lock), how an SSH login works, what is on the VM, how to give a teammate or client access safely and take it away again |
| [explainer-video](explainer-video/README.md) | How the 90 s client explainer video was made from a real call: Remotion (React video), cutting call audio with ffmpeg, captions, music ducking, loudness, personalised versions per prospect |
| [path-a-journal](path-a-journal/README.md) | Step-by-step log of every change made to the demo server: commands run, why, how it was checked, how to undo. Hand-drawn note pages in `notes/` |
| [deployment](../deploy/README.md) | Production deployment in 8 phases: static IP, domain, Docker Compose (Postgres + n8n + Caddy), migrating credentials, Dograh hookup, backups, monitoring, client handover |

Related files in the project root:

- `voice-agent-end-to-end-guide.canvas.tsx`: full workflow walkthrough (n8n + Dograh + Google Sheets) and client delivery.
- `n8n-gcp-observability.canvas.tsx` and `n8n-gcp-monitoring-map.jpg`: monitoring the VM in Google Cloud.
