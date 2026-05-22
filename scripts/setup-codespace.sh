#!/usr/bin/env bash
# Auto-runs in Codespace via postCreateCommand.
# Creates .env if it doesn't already exist.
set -e

if [ -f .env ]; then
  echo ".env already exists — skipping setup."
  exit 0
fi

cat > .env <<'ENVEOF'
AUTH_SECRET=jncFrPpv6bL9xCF3FsyGfbSOmvgjmpHJIjIq7Y12MRU=
AUTH_TRUST_HOST=true
ADMIN_EMAILS=kuldeepjotaniya83@gmail.com,rudraxdevelopment98@gmail.com,jayeshprajapati446@gmail.com
DATABASE_URL=postgresql://neondb_owner:npg_Pnj8pq3HKaiC@ep-misty-morning-apgjxze8-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
YOUTUBE_API_KEY=AIzaSyDz1gd5hDVxzQFrmKTRgkH3Dp2qViunHvo
CLOUDINARY_CLOUD_NAME=dmita0koo
CLOUDINARY_API_KEY=147748262948459
CLOUDINARY_API_SECRET=ujtoJ14xITGlP2CIkeralEQI3go
GOOGLE_CLIENT_ID=PASTE_YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=PASTE_YOUR_GOOGLE_CLIENT_SECRET_HERE
ENVEOF

echo ""
echo "✓ .env created."
echo ""
echo "⚠  Open .env and fill in GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
echo "   Then run:  npm run dev"
