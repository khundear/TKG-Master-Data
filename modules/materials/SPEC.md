# Materials — spec

Reference screens: `prototype/index.html` (`#mat…` routes). Business rules: `IMPLEMENTATION-CONTEXT.md`, `CLAUDE.md`.

## Left menu

| Section | Item | Route | Prototype state |
|---|---|---|---|
| — | ภาพรวม | `#mat` | built |
| วัตถุดิบและวัสดุ | รายการ Material | `#mat-list` | built |
| | รายการซื้อ (ยี่ห้อ / แพ็ก) | `#mat-buy` | empty — no brand / pack data in the sheet yet |
| | ของผลิตเอง (ครัวกลาง) | `#mat-sm` | built (9 SM) |
| | การใช้ตามแบรนด์ | `#mat-brands` | built |
| หมวดและหน่วย | หมวด Material | `#mat-cats` | built (Bible tree 21 · 101 · 22) |
| | หน่วยและอัตราแปลง | `#mat-units` | built (units only; no conversions in the sheet) |
| ตรวจทานข้อมูล | รอจัดหมวด | `#mat-review` | built (67 decide · 277 move · 1 check) |
| | รหัสเก่า–ใหม่ | `#mat-ids` | built (109 changed) |
| การกำกับดูแล | คำขออนุมัติ | `#mat-approve` | placeholder |
| ข้อมูลและรายงาน | นำเข้า / ส่งออกข้อมูล | `#mat-io` | placeholder |
| | ประวัติการเปลี่ยนแปลง | `#mat-log` | placeholder |
| (footer) | ตั้งค่า | `#mat-config` | placeholder |

## List

- Columns: รหัส Material (with legacy ID under it when changed) · ชื่อ · หมวด · แบรนด์ที่ใช้ (TK HK NT OK; dashed = not specified) · หน่วย · สถานะหมวด.
- Filters: brand pills (all, each brand, shared 2+, not specified), search (ID, legacy ID, name, category), group RM/SP/SM, main category, category status, **มีหมู** filter, category from the tree, unit.
- Cancelled items are hidden unless the status filter asks for them.
- Row opens a detail drawer: IDs, categories (current → proposed, Bible code, note), brands, unit and storage.

## Source columns

`tools/export_data.py` documents which sheet and column each field comes from.
