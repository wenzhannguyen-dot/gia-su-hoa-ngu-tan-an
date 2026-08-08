#!/usr/bin/env bash
set -euo pipefail

# Remove all *.mp3 files from the repository history using git-filter-repo.
# USAGE:
# 1) Download and run this script on a machine with network access and git installed.
# 2) Ensure you have the necessary permissions to force-push to the repository.
# 3) The script creates a backup mirror before rewriting history.

REPO_URL="https://github.com/wenzhannguyen-dot/gia-su-hoa-ngu-tan-an.git"
BACKUP_DIR="$(pwd)/gia-su-hoa-ngu-tan-an.git.backup.$(date +%Y%m%d%H%M%S)"
MIRROR_DIR="$(pwd)/gia-su-hoa-ngu-tan-an.git.mirror.$(date +%Y%m%d%H%M%S)"
DRY_RUN=false  # set to true to stop before pushing

echo "==== Remove all '*.mp3' from repo history ===="
echo "Repo: $REPO_URL"
echo "Backup will be created at: $BACKUP_DIR"
echo "Working mirror at: $MIRROR_DIR"
echo

# Prereqs
if ! command -v git >/dev/null 2>&1; then
  echo "Error: git not found. Install git and re-run." >&2
  exit 1
fi

if ! command -v git-filter-repo >/dev/null 2>&1; then
  echo "git-filter-repo not found."
  echo "Install with: python3 -m pip install --user git-filter-repo"
  echo "Or see: https://github.com/newren/git-filter-repo"
  exit 1
fi

# 1) Create a mirror backup (bare repo)
echo "Cloning mirror (backup)..."
git clone --mirror "$REPO_URL" "$BACKUP_DIR"
echo "Backup mirror created."

# 2) Clone another mirror to operate on
echo "Cloning mirror for filter operation..."
git clone --mirror "$REPO_URL" "$MIRROR_DIR"
cd "$MIRROR_DIR"

# 3) Double-check current size and mp3 existence (informational)
echo
echo "Current mp3 objects in history (if any):"
git rev-list --objects --all | grep -i '\.mp3' || echo "No tracked mp3 paths found by name (may still exist as blobs without names)."

echo
echo "Running git-filter-repo to remove all files matching '*.mp3' from all refs..."
# This will rewrite ALL refs to remove those paths
git filter-repo --invert-paths --path-glob '*.mp3'

echo "Filter complete. Expiring reflogs and running GC..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 4) Verify no mp3 objects left
echo
echo "Verifying no mp3 paths remain in the repo..."
if git rev-list --objects --all | grep -i '\.mp3' >/dev/null 2>&1; then
  echo "ERROR: Some mp3 paths still present after filter-repo." >&2
  echo "Run 'git rev-list --objects --all | grep -i "\\.mp3"' inside $MIRROR_DIR for details." >&2
  exit 2
fi
echo "No mp3 paths found by name."

# Additional check: list large objects to confirm size drop (informational)
echo
echo "Largest objects (top 20) after filter (sha size path):"
git rev-list --objects --all | \
  git cat-file --batch-check='%(objectname) %(objecttype) %(objectsize) %(rest)' 2>/dev/null \
  | awk '$2=="blob" {print $0}' | sort -k3 -n -r | head -n 20 || true

# 5) Push changes (force) to remote
if [ "$DRY_RUN" = true ]; then
  echo "DRY_RUN=true — skipping push. Inspect $MIRROR_DIR locally."
  echo "To push, set DRY_RUN=false and re-run the script."
  exit 0
fi

echo
read -p "About to force-push rewritten history to origin. This will overwrite remote history. Proceed? (type YES to continue): " CONFIRM
if [ "$CONFIRM" != "YES" ]; then
  echo "Aborted by user."
  exit 1
fi

echo "Force-pushing all branches..."
git push --force --all origin
echo "Force-pushing all tags..."
git push --force --tags origin

echo "Push complete."

cat <<EOF

DONE: All '*.mp3' files have been removed from history and changes pushed (force).
Please inform all collaborators: they MUST re-clone the repository, e.g.:

  git clone $REPO_URL

If a collaborator wants to keep local branches, they need to follow a careful procedure
to rebase/reset onto the new history; otherwise advise a fresh clone.

Recommended: add '*.mp3' to .gitignore on the main branch to avoid re-adding files.

To add .gitignore:
  git clone $REPO_URL temp-repo
  cd temp-repo
  echo '*.mp3' >> .gitignore
  git add .gitignore
  git commit -m "Add .mp3 to .gitignore"
  git push origin HEAD

Backup mirror is at: $BACKUP_DIR
You can keep that backup safe in case you need to restore.

EOF

exit 0
