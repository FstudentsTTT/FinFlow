#!/bin/bash
set -e

VENV=/var/www/fastuser/data/finflow/venv

echo "=== 1. Python paketlari o'rnatilmoqda ==="
$VENV/bin/pip install pdfplumber openpyxl -q
echo "pdfplumber va openpyxl o'rnatildi"

echo "=== 2. Backend syntax tekshiruvi ==="
cd /var/www/fastuser/data/finflow/backend
$VENV/bin/python -c "from gemini_service import extract_financials_from_document, generate_advisory; print('Backend importlar OK')"

echo "=== 3. PM2 restart ==="
pm2 restart 0
sleep 3
pm2 restart 2

echo "=== 4. Holat ==="
pm2 status

echo ""
echo "=== TAYYOR! ==="
echo "Frontend: http://74.113.235.70:3000"
echo "Backend:  http://74.113.235.70:8000"
