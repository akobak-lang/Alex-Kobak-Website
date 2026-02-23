#!/bin/bash
# autopush.sh — watches the site folder and auto-commits + pushes to GitHub

SITE_DIR="/Users/alexkobak/Library/CloudStorage/Dropbox/Claude/Alex Website"
DEBOUNCE=5   # seconds to wait after last change before committing

echo "👀  Watching for changes… (press Ctrl+C to stop)"
echo ""

last_hash=""

while true; do
  # Build a hash of all tracked file contents + modification times
  current_hash=$(find "$SITE_DIR" \
    -not -path "*/.git/*" \
    -not -path "*/.claude/*" \
    -not -name ".DS_Store" \
    -not -name "*.mov" \
    -type f \
    -exec stat -f "%m %N" {} \; 2>/dev/null | sort | md5)

  if [ "$current_hash" != "$last_hash" ] && [ -n "$last_hash" ]; then
    echo "📝  Change detected — waiting ${DEBOUNCE}s for you to finish…"
    sleep $DEBOUNCE

    cd "$SITE_DIR"

    # Only commit if there are actual git changes
    if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
      TIMESTAMP=$(date "+%b %d %H:%M")
      git add .
      git commit -m "Update — $TIMESTAMP"
      git push && echo "✅  Pushed to GitHub at $TIMESTAMP" || echo "❌  Push failed — check your internet / credentials"
      echo ""
    fi

    # Refresh hash after commit
    current_hash=$(find "$SITE_DIR" \
      -not -path "*/.git/*" \
      -not -path "*/.claude/*" \
      -not -name ".DS_Store" \
      -not -name "*.mov" \
      -type f \
      -exec stat -f "%m %N" {} \; 2>/dev/null | sort | md5)
  fi

  last_hash="$current_hash"
  sleep 3
done
