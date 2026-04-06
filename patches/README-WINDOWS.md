# Mobile fix not on GitHub yet?

If `git log -1` shows `81bf3cd` but not `fix(mobile): overflow, safe areas...`, your GitHub `main` never received that commit (it may exist only on another clone).

## Option A — Apply the unified diff (this folder)

1. Copy `mobile-fix-unified.diff` into your project root (same folder as `app/`).
2. In PowerShell:

```powershell
cd "E:\Minrosh Website"
git apply --check mobile-fix-unified.diff
git apply mobile-fix-unified.diff
git add app/globals.css app/layout.js
git status
git commit -m "fix(mobile): overflow, safe areas, single-column grids, nav drawer scroll"
git push origin main
```

If `git apply` fails with line-ending errors, try:

```powershell
git apply --ignore-whitespace mobile-fix-unified.diff
```

## Option B — Push from the machine that has commit `e627b19`

On any computer where `git log -1` shows the mobile fix commit, configure GitHub (PAT or SSH) and run:

```bash
git push origin main
```

Then on Windows:

```powershell
cd "E:\Minrosh Website"
git pull origin main
```

## Notes

- `cd /path/to/minrosh-migration` in docs means “use **your** project path”, e.g. `E:\Minrosh Website`.
- `git add` with no path does nothing; use `git add .` or `git add <file>`.
