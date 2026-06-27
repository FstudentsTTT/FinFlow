#!/bin/bash
set -e
echo "============================================"
echo "   FinFlow AI — To'liq Rebuild & Restart    "
echo "============================================"

VENV=/var/www/fastuser/data/finflow/venv
FRONTEND=/var/www/fastuser/data/finflow/frontend

# 1. Python paketlar
echo ""
echo "[1/4] Python paketlari o'rnatilmoqda..."
$VENV/bin/pip install pdfplumber openpyxl -q
$VENV/bin/python -c "import pdfplumber, openpyxl; print('    pdfplumber + openpyxl OK')"

# 2. Backend syntax tekshiruvi va restart
echo ""
echo "[2/4] Backend tekshiruv va restart..."
cd /var/www/fastuser/data/finflow/backend
$VENV/bin/python -c "
from gemini_service import extract_financials_from_document, generate_advisory, generate_chat_response
from main import app
print('    Backend importlar OK')
"
pm2 restart 0
sleep 2
echo "    Backend restarted"

# 3. Frontend rebuild (eng ko'p vaqt oladi: 1-3 daqiqa)
echo ""
echo "[3/4] Frontend build boshlandi..."
echo "    (Bu 1-3 daqiqa davom etadi, kuting...)"
cd $FRONTEND
npm run build
echo "    Build muvaffaqiyatli tugadi!"

# 4. Frontend restart
echo ""
echo "[4/4] Frontend restart..."
pm2 restart 2
sleep 4

# Holat
echo ""
echo "============================================"
pm2 status
echo ""
echo "Tekshirish:"
sleep 2
curl -s http://localhost:8000/api/v1/health | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  Backend: {d[\"status\"]}')"
echo "  Frontend: http://74.113.235.70:3000"
echo "  Audit:    http://74.113.235.70:3000/dashboard/audit"
echo ""
echo "=== HAMMASI TAYYOR! ==="
