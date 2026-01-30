#!/usr/bin/env bash
set -e

DATE=$(date +%Y-%m-%d)
BACKUP_NAME="goodnews-backup-${DATE}.db"

if [[ -f goodnews.db ]]; then
  mv goodnews.db "$BACKUP_NAME"
  echo "Renamed goodnews.db -> $BACKUP_NAME"
else
  echo "No local goodnews.db; skipping rename."
fi

scp ubuntu@welcome.news:/var/www/goodnews/goodnews.db ./goodnews.db
echo "Fetched goodnews.db from welcome.news"
