# SKU (Selling) — spec

Reference screens: `prototype/index.html` (`#sku…` routes). Business rules: `IMPLEMENTATION-CONTEXT.md`, `CLAUDE.md`.

**SKU data is not final. Build screens on today's data; do not cleanse or restructure it.**

## Left menu

| Section | Item | Route | Prototype state |
|---|---|---|---|
| — | ภาพรวม | `#sku` | built |
| สินค้าขาย | รายการ SKU | `#sku-list` | built (2,418) |
| | การเปิดขายรายสาขา | `#sku-stores` | built (1 store per brand today) |
| | รหัส POS | `#sku-pos` | built |
| หมวดหมู่ | หมวด SKU กลาง | `#sku-cats` | built |
| | หมวดเมนูแบรนด์ | `#sku-brandcats` | built |
| ตรวจทานข้อมูล | ข้อมูลที่ต้องเติม | `#sku-gaps` | built |
| | งดขายชั่วคราว | `#sku-paused` | built (43) |
| การกำกับดูแล | คำขอเพิ่ม / ปรับ / เลิกขาย | `#sku-approve` | placeholder |
| ข้อมูลและรายงาน | นำเข้า / ส่งออกข้อมูล | `#sku-io` | placeholder |
| | ประวัติการเปลี่ยนแปลง | `#sku-log` | placeholder |
| (footer) | ตั้งค่า | `#sku-config` | placeholder |

## List

- Columns: รหัสอ้างอิงชั่วคราว (Master Record Key; not the TKG code) · ชื่อเมนู (EN, TH under it) · แบรนด์ · หมวดกลาง · หมวดเมนูแบรนด์ · ราคา · สถานะ.
- Filters: brand pills with counts, search (names, reference key, POS ID, POS code), type (L1), central category (L2), status, gap filters from ข้อมูลที่ต้องเติม.
- Row opens a detail drawer: central categories + SKU Category Code, brand menu category, POS mapping (store, POS internal ID, POS SKU code, POS name, group, price, snapshot date), mapping note.
- POS codes are shown as mappings (↔) to the temporary reference key (Master Record Key), never as the item's ID.
