# prototype

Approved clickable prototype (static HTML, real data). Generate data.json first:

    python3 -I tools/export_data.py

Then serve this folder (fetch needs http, not file://):

    python3 -I -m http.server 8791 --bind 127.0.0.1

Fonts: Google Sans (SIL OFL, see fonts/OFL.txt), copied from ICW-OS-DESIGN.
