# Student Leave Management System (SLMS)

Minimal MERN scaffold for Student Leave Management System.

Folders:
- backend/: Express + MongoDB API
- frontend/: React app

On Windows, run the bundled PowerShell helper to start both dev servers:

1. Open PowerShell in the project root and run:

```powershell
.\start-dev.ps1
```

This script installs dependencies (if needed), creates a `.env` from `backend/.env.example` when missing, and starts backend and frontend dev servers in background processes using `npm.cmd` (avoids Start-Process Win32 error).

See `backend/README.md` and `frontend/README.md` for further details.
