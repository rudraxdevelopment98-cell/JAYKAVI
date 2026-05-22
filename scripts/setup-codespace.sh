#!/usr/bin/env bash
# One-shot environment setup for Codespace.
# Creates .env from the values provided by the project owner.
# Run once after cloning: bash scripts/setup-codespace.sh
#
# After this, run: npm install && npm run dev
set -e

if [ -f .env ]; then
  echo ".env already exists. Aborting (delete it first if you want to overwrite)."
  exit 1
fi

cat > .env <<'ENVEOF'
AUTH_SECRET=jncFrPpv6bL9xCF3FsyGfbSOmvgjmpHJIjIq7Y12MRU=
AUTH_TRUST_HOST=true
ADMIN_EMAILS=kuldeepjotaniya83@gmail.com
DATABASE_URL=postgresql://neondb_owner:npg_Pnj8pq3HKaiC@ep-misty-morning-apgjxze8-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
GOOGLE_CLIENT_ID=REPLACE_WITH_YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=REPLACE_WITH_YOUR_GOOGLE_CLIENT_SECRET
YOUTUBE_API_KEY=REPLACE_WITH_YOUR_YOUTUBE_API_KEY
CLOUDINARY_CLOUD_NAME=dmita0koo
CLOUDINARY_API_KEY=147748262948459
CLOUDINARY_API_SECRET=REPLACE_WITH_YOUR_CLOUDINARY_SECRET
ENVEOF

echo ".env created."
echo "Next steps:"
echo "  1) Edit .env and replace the REPLACE_WITH_* lines with the real values"
echo "     (the project owner has them in their notes)"
echo "  2) npm install"
echo "  3) npm run dev"
