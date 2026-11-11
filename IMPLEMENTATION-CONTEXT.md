# TKG Master Data — Context สำหรับพัฒนาต่อบนแพลตฟอร์มองค์กร

ปรับปรุง: 11 พฤศจิกายน 2026 (Asia/Bangkok) — แก้ไขครั้งล่าสุด: เปลี่ยนแนวทาง UI ให้ยึด ICW-OS-DESIGN แทน Wireframe ที่ CEO เห็นชอบและ TKG CI (ดูหัวข้อ 4)

เอกสารนี้รวบรวมข้อสรุปจากการสนทนา ข้อมูลที่ตรวจพบ และสถานะชิ้นงาน เพื่อให้ทีมองค์กรหรือ AI agent รับช่วงได้โดยไม่เริ่มเก็บความต้องการใหม่ทั้งหมด

> แยกให้ออก: ข้อสรุปธุรกิจที่ตกลงแล้ว / ข้อเสนอฐานข้อมูล / สิ่งที่ POC ทำได้จริง / เรื่องที่ยังต้องออกแบบ ก่อนนำไปใช้จริง ห้ามถือว่าข้อเสนอทางเทคนิคทุกข้อได้รับอนุมัติจาก CEO แล้ว

## 1. เป้าหมายและทิศทาง

จัดทำ Master Data กลางของต้นเครื่องกรุ๊ป (TKG) สำหรับ 4 แบรนด์ รองรับ Material Master (Buying) และ Selling SKU Master และส่งต่อข้อมูลที่เชื่อถือได้ให้ BOM Master Data, POS และ OS กลางขององค์กรในอนาคต

CEO ให้ความสำคัญกับ **Single Source of Truth** ส่วน UI ให้ยึด **ICW-OS-DESIGN** ทั้งหน้าตา โครงหน้า และการนำทาง (11 พ.ย. 2026) ไม่ต้องรักษา Wireframe Dashboard ที่ CEO เคยเห็นชอบอีกต่อไป

เดิมตั้งใจใช้ Railway ต่อมาผู้ใช้ต้องการนำไป implement บนแพลตฟอร์มองค์กร จึงต้องยืนยันสถาปัตยกรรมปลายทางอีกครั้ง โดยไม่ผูก business model กับผู้ให้บริการ hosting

### แบรนด์

| Code | แบรนด์ |
|---|---|
| TK | ต้นเครื่อง |
| HK | หางเครื่อง |
| NT | NONNA TWIST |
| OK | อุ่นเครื่อง |

### หลักการ Single Source of Truth ที่โครงสร้างต้องสนับสนุน

- Material มาตรฐานเก็บตัวตนกลางครั้งเดียว เชื่อมแบรนด์ที่อนุญาตให้ใช้ผ่านตารางความสัมพันธ์ ไม่คัดลอก Master แยกทุกแบรนด์
- แยก Material มาตรฐานออกจากยี่ห้อ/แพ็กซื้อ และรวมแพ็กเข้าด้วยกันได้เมื่อยืนยันการทดแทนตาม specification แล้ว
- Selling SKU มีรหัสถาวรกลาง แยกตามแบรนด์ ชื่อเหมือนกันต่างแบรนด์ยังเป็นคนละ SKU
- หมวด หน่วย และอัตราแปลงมีแหล่งอ้างอิงที่ควบคุม ไม่พิมพ์อิสระซ้ำตามระบบ
- Web App เป็นที่แก้ Master หลักหลังเริ่มใช้จริง Sheets เป็นช่องเตรียมนำเข้า/ส่งออก การนำเข้าต้องตรวจและอนุมัติ
- ระบบอื่นอ่าน Master ที่เผยแพร่แล้วผ่านข้อตกลงการเชื่อมต่อเดียวกัน รหัส POS เป็น mapping กับรหัสกลาง ไม่ใช้แทนรหัสถาวร TKG
- เก็บ revision และหลักฐานอนุมัติ สูตรที่อนุมัติแล้วอ้างรุ่นที่แน่นอน ไม่เปลี่ยนตาม Master ใหม่โดยเงียบ ๆ
- Single Source of Truth หมายถึงเจ้าของข้อมูลและกติกาเผยแพร่ที่ชัดเจน ไม่ได้บังคับว่าทุกระบบต้องเขียนลงฐานข้อมูลเดียวกันโดยตรง

## 2. ข้อสรุปที่ผู้ใช้เลือกแล้ว

| เรื่อง | ข้อสรุป |
|---|---|
| รูปแบบแอป | ระบบเดียว แยก 2 โมดูล Material และ Selling SKU |
| ระยะแรก | Master Data และส่งต่อ BOM ไม่ทำธุรกรรมซื้อขายหรือสต็อก |
| ผู้จัดการข้อมูล | ทีมเสนอ ส่วนกลางอนุมัติก่อนใช้จริง |
| BOM ระยะแรก | สร้างสูตร ระบุส่วนประกอบ ปริมาณ และหน่วย ยังไม่คำนวณต้นทุนจากราคาซื้อ |
| การเปลี่ยนที่กระทบสูตร | เก็บประวัติ แสดงผลกระทบ และให้ทบทวน BOM ก่อนนำการเปลี่ยนไปใช้ |
| Material กับแบรนด์ | Material กลาง + ระบุแบรนด์ที่ใช้/อนุญาตใช้ |
| หลายยี่ห้อ/แพ็ก | BOM อ้าง Material มาตรฐาน รายการซื้อแยกต่างหาก ต้องยืนยันว่าใช้ทดแทนกันได้ |
| ของผลิตเอง | รองรับของครัวกลางผลิตเองและสูตรย่อย เตรียมให้สูตรอ้างสูตรย่อยได้ |
| SKU ข้ามแบรนด์ | แยก SKU และสูตรตามแบรนด์ แม้ชื่อเหมือนกัน เชื่อมกลุ่มเพื่อรายงานรวมได้ภายหลัง |
| SKU ข้ามสาขาในแบรนด์เดียว | สูตรเดียวกันทุกสาขา หากส่วนประกอบหรือปริมาณต่าง ต้องแยก SKU ใหม่ |
| รูปแบบขาย | ระยะแรก 1 SKU = 1 รูปแบบขายชัดเจน ขนาด/รูปแบบที่สูตรต่างแยก SKU เตรียมขยายตัวเลือก/ชุดภายหลัง |
| จุดแก้ข้อมูลหลัก | Web App เป็นหลัก ไม่ใช้ Sheets เป็นอีก Master ที่แก้คู่ขนาน |
| หมวด | แยก Material / SKU กลาง / เมนูแบรนด์ รองรับ Main → Sub → รายการ และหมวดชั้น 3 ตามต้นทาง |
| สิทธิ์ | ส่วนกลางเห็นทั้งหมด ทีมแบรนด์เห็นตามขอบเขตแบรนด์ Material ตามสิทธิ์และแบรนด์ที่ใช้ |
| ระบบปลายทาง | BOM และ OS ยังอยู่ช่วงแนวคิด ไม่มีระบบเดิมบังคับรูปแบบ |
| ประเภท Material | อาหาร/เครื่องดื่ม บรรจุภัณฑ์ ของใช้สิ้นเปลือง พร้อม flag ว่าใช้ใน BOM ได้หรือไม่ แยกของผลิตเอง |
| หน่วย | กก.↔กรัมใช้มาตรฐาน ขวด↔มล. กก.↔ชิ้น กรัม↔มล. ต้องมีค่าที่วัดและอนุมัติเฉพาะรายการ หากไม่มีให้หยุดการแปลง |
| ข้อมูลจัดซื้อ/คลังอื่น | เก็บ raw ต้นฉบับ แต่ Supplier คลัง ตำแหน่ง MOQ Lead Time ราคา ยังไม่เปิดเป็นโมดูลบริหารในระยะแรก |
| SKU ID | ต้องมีรหัสถาวร TKG เพื่อนำไปใช้ใน POS และระบบอื่น เก็บ mapping รหัสภายนอกแยก |

## 3. ขอบเขตและสถานะ POC ปัจจุบัน

**ทำแล้ว:** Web App บนเครื่อง แบบ read-only ใช้สำเนาข้อมูลจริงครบ 4 แบรนด์ ใช้ TKG CI และโลโก้ (ต้องปรับเป็น ICW-OS-DESIGN ตามหัวข้อ 4) เรียกดูหมวด รายการ จำนวน Cross Filter และรายละเอียดพร้อมที่มาข้อมูล

**ยังไม่มี:** Database จริง, Server API, Login, สิทธิ์บังคับใช้จริง, การแก้ Master, Workflow อนุมัติ, นำเข้าผ่าน UI, เชื่อม POS, สูตร BOM, การคำนวณต้นทุน, Deployment บน Railway/แพลตฟอร์มองค์กร

อย่าใช้คำว่า “อนุมัติแล้ว” กับยอดใน POC เพราะ Sheet ที่อ่านไม่มีสถานะอนุมัติ Master ตัวเลขใน Wireframe เดิมเป็น mock (Wireframe นั้นเลิกใช้แล้ว ดูหัวข้อ 4)

### การตัดสินใจเพิ่มเติมสำหรับ POC

1. ช่อง TK/HK/NT/OK: TRUE = ระบุว่าใช้, FALSE = ยังไม่ระบุว่าใช้ **ไม่ใช่ยืนยันว่าไม่ใช้**
2. มุมมองชิ้นส่วนหมูต้องเป็นข้อเสนอจับคู่ราย Material ID พร้อมเหตุผล รอผู้รับผิดชอบตรวจ ไม่จัดกลุ่มแล้วถือว่ารับรองอัตโนมัติจากชื่อ
3. เปิดดูบนเครื่องก่อน ครบ 4 แบรนด์ ไม่ Deploy และไม่เขียนกลับต้นทาง
4. “เจาะลึกวัตถุดิบหมู” **ห้ามเป็นเมนูหลัก** ผู้ใช้ทักท้วงและแก้แล้ว ให้เข้าผ่าน Material Master → หมวด PORK → ตัวกรองชิ้นส่วน/เปรียบเทียบแบรนด์ (กติกานี้ยังใช้ แม้เปลี่ยนเป็น ICW-OS-DESIGN)

## 4. UI: ยึด ICW-OS-DESIGN

**ตัดสินใจ 11 พ.ย. 2026:** UI ทั้งหมดยึด ICW-OS-DESIGN ทั้งหน้าตา ฟอนต์ สี component โครงหน้า และการนำทาง **ไม่ต้องรักษา** Wireframe Dashboard ที่ CEO เคยเห็นชอบ (`TKG-Dashboard-HiFi.png`, Sidebar 8 เมนู, การ์ดสรุป 3 ช่อง) และ **ไม่ใช้** TKG CI เดิม (ครีม/น้ำตาล/ทอง, Google Sans / Noto Serif Thai) อีกต่อไป

### แหล่งอ้างอิง

- Repo: `github.com/ICW-AI/ICW-OS-DESIGN` (private, ต้องมีสิทธิ์ใน ICW-AI) สำเนาบนเครื่อง `/Users/Dear/Claude/ICW-OS-DESIGN`
- Repo นี้ **อ่านอย่างเดียว** ห้ามแก้ไข commit หรือ push ชิ้นงาน TKG ต้องอยู่นอก repo
- Design system: `System-Design/ICW.OS - Design System (Full)/` (`readme.md`, `SKILL.md`, `guidelines/`, `components/`, `assets/`)
- กติกา UI และตัวอย่างแอปจริง: `Apps/UI-STANDARDS.md`, `Apps/_shared/` (AppShell, listkit, kit-tree, importexport, categories ฯลฯ) และแอปใน `Apps/`
- แอปที่เกี่ยวข้องกับงานนี้โดยตรงและควรดูก่อนออกแบบ: `Apps/FoodCost`, `Apps/Recipes` (BOM), `Apps/Purchasing`, `Apps/Supplier`
- ข้อความที่ผู้ใช้เห็นเขียนเป็นไทยและรองรับ TH/EN ตามกติกา `_t()` ใน `CLAUDE.md` ของ repo

### สิ่งที่ยังใช้ต่อ (ไม่ใช่เรื่องหน้าตา)

- ส่วนงานที่ต้องมีครบ: ภาพรวม, Material Master, Selling SKU Master, คำขออนุมัติ, นำเข้า/ส่งออก, ข้อมูลอ้างอิง, ประวัติการแก้ไข, ผู้ใช้และสิทธิ์ จัดวาง/ตั้งชื่อตามรูปแบบ ICW OS
- ส่วนที่ยังไม่เปิดใช้ต้องบอกชัดว่าเป็นระยะถัดไป ไม่สร้างคำขอหรือประวัติปลอม
- หมูเป็นตัวกรองใน Material Master ไม่ใช่เมนูหลัก
- Diagram สำหรับผู้บริหารต้องอ่านง่าย เลี่ยงศัพท์ 1:N / N:M ที่ไม่มีคำอธิบาย

ฟังก์ชันด้านล่างเป็นความต้องการด้านการใช้งาน ให้สร้างด้วย component และรูปแบบของ ICW-OS-DESIGN

### ภายใน Material Master

- ค้นหาชื่อ/รหัส เลือกแบรนด์ได้หลายแบรนด์
- เลือกประเภท Main / Sub / ชั้น 3 และแสดงจำนวน
- มุมมองรายการ / เปรียบเทียบแบรนด์ / หมวดและจำนวน
- เลือก OR = อย่างน้อยหนึ่งแบรนด์, AND = ทุกแบรนด์ที่เลือก
- กรองการใช้ร่วมกัน ตั้งแต่ 2 แบรนด์ / 1 แบรนด์ / ยังไม่ระบุทั้ง 4
- ดูหน่วยต้นทาง รหัสเก่า–ใหม่ และลิงก์แถวต้นทาง
- PORK มีตัวกรองข้อเสนอชิ้นส่วน สถานะรอตรวจ และเหตุผลในรายละเอียด

### ภายใน Selling SKU Master

- แยกแบรนด์ ค้นชื่อไทย/อังกฤษ/รหัส
- สลับหมวด SKU กลางกับหมวดเมนูของแบรนด์
- Drill down Main/Sub และนับจำนวน SKU
- กรองสาขา/สถานะ POS ตาม snapshot
- รายละเอียดแยก Master Record Key, TKG ID ที่ยังไม่ได้จัดสรร, POS Internal ID/Code และรายการขายรายสาขา

## 5. แหล่งข้อมูลและความหมายของข้อมูล

Material: https://docs.google.com/spreadsheets/d/1Mhe-PHGElVK5aH2wCwL2aLiimasbLwwPVUje74ws0zU/edit?gid=1067426596

Selling SKU: https://docs.google.com/spreadsheets/d/1MAsARyymA492iteVlar00drJdpmi0vPfMAdO6PzrHoM/edit?gid=852753524

**สถานะ Selling SKU (11 พ.ย. 2026):** ข้อมูลใกล้ final แต่ยังไม่ final ผู้ใช้จะแจ้งเมื่อพร้อมให้ช่วยปรับโครงสร้างฐานข้อมูล/cleansing ยอด SKU ด้านล่างจึงยังเปลี่ยนได้

เป็นผลตรวจ **สำเนาที่อยู่ในโปรเจกต์** ไม่ใช่ยอด Live และไม่รับรองว่าข้อมูลบน Sheet ปัจจุบันยังเท่าเดิม เวลา snapshot ดู `data.json` field `snapshotAt`

| ข้อมูล | แท็บ / ช่วงที่อ่าน |
|---|---|
| Material รุ่นหมวดล่าสุด | `Materials (All)!C20:AC1236` |
| Material เดิมและการใช้รายแบรนด์ | `Meterials (All Brands)!C9:Q1518` (ชื่อสะกดตามต้นทาง) |
| รหัส Material เก่า–ใหม่ | `Material ID Crosswalk!A4:L1220` |
| พจนานุกรมหมวด Material | `Material Master Bible!A15:Q320` |
| Selling SKU | `Selling SKU Master!A9:R2429` |
| POS / สาขา | `SKU–Store Mapping!A3:O2421` |
| หมวด SKU กลาง | `SKU Categories!A3:I134` |
| หมวดเมนูแบรนด์ | `Brand Menu Categories!A3:G205` |

กติกาจับคู่: Material รุ่นใหม่กับแบรนด์เดิมเชื่อมผ่าน Crosswalk เท่านั้น ไม่จับคู่ชื่อแล้วถือว่าเป็นตัวเดียวกัน เก็บ raw snapshot ทุกชุดใน `source/`

### ผลตรวจสำเนาข้อมูล

| รายการ | จำนวน |
|---|---:|
| Material ID ทั้งหมด | 1,194 |
| Material ยกเลิก | 2 |
| Material ค่าเริ่มต้นไม่รวมยกเลิก | 1,192 |
| Selling SKU / Master Record Key | 2,418 |
| POS Listings | 2,418 |
| SKU ช่อง Category Code ว่าง | 2,418 |
| SKU ไม่ระบุชื่อ Subcategory | 62 |
| Material ใน Sub Category PORK | 27 |
| Material ระบุใช้ตั้งแต่ 2 แบรนด์ (ไม่รวมยกเลิก) | 362 |
| Material ยังไม่ระบุใช้ทุกแบรนด์ (ไม่รวมยกเลิก) | 148 |

| แบรนด์ | Material ที่มี TRUE ในสำเนาต้นทาง | Selling SKU |
|---|---:|---:|
| TK | 597 | 704 |
| HK | 404 | 1,007 |
| NT | 367 | 402 |
| OK | 199 | 305 |

ยอด Material รายแบรนด์ทับซ้อนกัน ห้ามบวกเป็นยอด Material กลาง จำนวน Material ใน POC คือจำนวนรหัสต้นทาง ยังไม่ใช่จำนวนวัตถุดิบมาตรฐานหลังแยก/รวมแพ็กซื้อ

ไม่พบรหัส Material/SKU ซ้ำ การเชื่อม legacy/crosswalk ที่ขาด หรือ POS listing ที่ไม่มี SKU ในสำเนาที่ตรวจ ข้อสรุปนี้ไม่แทนการตรวจ integrity ฝั่ง Production

### ข้อจำกัดการตีความ

- หมวด SKU ใช้ชื่อที่มีจริงได้ แม้รหัสหมวดยังว่าง ห้ามสร้างรหัสขึ้นเองแล้วถือว่ารับรอง
- ไม่มีข้อมูล BOM จึงตอบได้เพียงแบรนด์ใด “ระบุใช้” Material ยังตอบไม่ได้ว่าใช้ในเมนูใด หรือปริมาณใช้เท่าไร
- หมูแปรรูปหมวด PROCESSED_MEAT ไม่ควรถูกสรุปว่าทุกรายการเป็นหมู
- ข้อเสนอชิ้นส่วนทั้ง 27 รายการเป็น `pending_review` จำนวนกลุ่มไม่ใช่จำนวนส่วนที่รับรอง
- POS readiness เป็นสถานะตาม snapshot ไม่ใช่สถานะขายสดหรือสถานะอนุมัติ Master
- ห้ามนำ FALSE จาก Sheet ไปแปลงเป็น `is_allowed=false` ในฐานข้อมูลจริงทันที ต้องออกแบบสถานะ unknown และการยืนยันก่อน

## 6. โครงสร้างฐานข้อมูลที่เสนอ

ข้อเสนอเดิม: **PostgreSQL 1 Database / 6 กลุ่ม / 30 ตาราง** ยังไม่ใช่ DDL ที่ติดตั้งแล้ว และไม่ใช่จำนวนตารางที่ต้องยึดตายตัวหลังรวม OS

Field / Type / PK / FK ทุกตารางอยู่ใน [Database Structure v1.1](../TKG-Master-Data-Proposal/Database-Structure-v1.1.md) และแนบสำเนาไว้ช่วงท้ายเอกสารนี้เพื่อให้ส่งต่อไฟล์เดียวได้

| กลุ่ม | ตาราง |
|---|---|
| องค์กรและสิทธิ์ (6) | brands, branches, users, roles, user_roles, user_brand_scopes |
| หมวดและหน่วย (5) | category_schemes, categories, category_revisions, units, standard_unit_conversions |
| Material (7) | materials, material_revisions, purchase_items, purchase_item_revisions, material_brand_permissions, item_conversions, item_conversion_revisions |
| Selling SKU (3) | selling_skus, sku_revisions, sku_branch_listings |
| รหัสเชื่อมต่อ (3) | entity_registry, external_systems, external_identifiers |
| อนุมัติและนำเข้า (6) | change_requests, change_request_items, approval_decisions, audit_events, import_batches, import_rows |

### ความสัมพันธ์ที่สำคัญ

- Material หนึ่งรายการมีรายการซื้อได้หลายรายการ เช่น น้ำตาลมาตรฐาน → ยี่ห้อ A ถุง 1 กก. / ยี่ห้อ B ถุง 5 กก.
- Material หลายรายการใช้ได้ในหลายแบรนด์ ผ่านตารางเชื่อม ไม่คัดลอกตัวตนกลาง
- Brand หนึ่งมี SKU หลายรายการ SKU หนึ่งเป็นของแบรนด์เดียว
- SKU หนึ่งเปิดขายได้หลายสาขา โดยสาขาต้องอยู่แบรนด์เดียวกับ SKU
- Entity ถาวรมี revisions หลายรุ่น เก็บ current approved revision แยก
- Entity หนึ่งมี external identifiers หลายตัวได้ เช่น Sheets ID และ POS ID แต่ต้องแยก system/scope/ช่วงเวลา
- Category ใช้ parent revision สร้างลำดับชั้น แยกชุดหมวดและแบรนด์ ห้ามวงจร

### ข้อควรระวังก่อนแปลงข้อเสนอเป็น Production

- ต้องตกลง nullable fields, enums, unique constraints, indexes, transaction boundaries และ retention ให้ครบ
- 30 ตารางยังไม่รวม BOM, Supplier, ราคา, สต็อก และธุรกรรม
- ถ้า OS มีองค์กร/ผู้ใช้/บทบาทอยู่แล้ว ให้ใช้ตัวตนและระบบสิทธิ์ของ OS แทนสร้าง Master แข่งขันกัน
- การสร้าง entity_registry ล่วงหน้าสำหรับคำขอเพิ่มใหม่ และความหมายของตัวตนที่ยังไม่เผยแพร่ ต้องกำหนดให้ชัด
- สิทธิ์รายแบรนด์และ Branch Listing เป็นข้อมูลตามช่วงเวลา ไม่ใช่แก้ bool ทับโดยไม่มีประวัติ

## 7. Workflow / WI: ขอเพิ่ม ปรับ ยกเลิก SKU

ผู้ใช้ขอ Diagram ของ WI ใส่ใน Keynote ที่ปรับ format แล้ว มีไฟล์ผลลัพธ์อยู่ใน proposal folder การสรุปต่อไปนี้เป็นแนวทางสำหรับ implement ต้องยืนยันรายละเอียดผู้รับผิดชอบและสถานะกับองค์กร

1. ทีมแบรนด์สร้างคำขอ เลือกเพิ่ม / ปรับ / เลิกใช้ ระบุเหตุผล ชื่อ รูปแบบขาย หมวด หน่วย แบรนด์ สาขา และรหัสภายนอกที่เกี่ยวข้อง
2. ตรวจข้อมูลบังคับ ความซ้ำ และรหัสอ้างอิง ถ้าเปลี่ยนสูตร/ปริมาณ ต้องพิจารณาว่าเป็น SKU ใหม่ตามกติกาธุรกิจ ไม่ใช่แก้ทับให้สาขาใช้สูตรต่างกัน
3. ตรวจผลกระทบต่อ BOM, Branch Listing, POS mapping และระบบปลายทาง ระบบ POC ยังไม่มี reference จริงสำหรับทำ impact analysis
4. ส่วนกลางพิจารณา อนุมัติ / ส่งกลับแก้ / ปฏิเสธ ผู้เสนอไม่อนุมัติคำขอตนเองตามข้อเสนอควบคุม
5. ก่อนเผยแพร่ ตรวจ revision ฐานอีกครั้งเพื่อป้องกันคำขอชนกัน
6. อนุมัติแล้วบันทึก revision ใหม่และผลอนุมัติใน transaction เดียว Approved revision แก้ทับไม่ได้
7. กำหนดวันมีผล เผยแพร่ข้อมูล และให้ระบบปลายทางรับทราบตาม integration contract
8. เก็บ audit และสถานะรับข้อมูลปลายทาง การอนุมัติ Master ไม่เท่ากับ POS sync สำเร็จ

การยกเลิกใช้สถานะเลิกใช้ ไม่ลบตัวตนที่ถูกอ้างอิง และไม่เอารหัสเดิมไปให้ตัวตนใหม่ การเปลี่ยนที่กระทบ BOM ต้องเข้าสู่การทบทวนสูตรเดิม ไม่เปลี่ยนสูตรย้อนหลังอัตโนมัติ

ข้อเสนอ v1.1 ใช้คำขอหลายรายการแบบอนุมัติทั้งชุด หากอยากอนุมัติบางส่วนให้แยกคำขอ นี่เป็นข้อเสนอ implementation ไม่ใช่ข้อบังคับที่ยืนยันจากผู้ใช้โดยตรง

## 8. แนวทางเชื่อม OS / BOM / POS

หลักการที่ตกลง: รหัสถาวร, revision, สิทธิ์, การอนุมัติ และ mapping ข้ามระบบ ส่วนรายละเอียด API/event ต่อไปนี้ยังเป็นงานออกแบบ

- ใช้ UUID ถาวรสำหรับเชื่อมภายใน และ human-readable code ตาม convention ที่องค์กรจะเลือก
- เก็บ POS Internal ID และ POS Code แยกตามระบบ/แบรนด์/สาขาหรือ scope ที่จำเป็น ห้ามเดาความ unique ข้ามทุกสาขา
- API สำหรับอ่านข้อมูลต้องให้รหัส ตัวตน รุ่น สถานะ วันมีผล หมวด หน่วย และขอบเขตแบรนด์อย่างชัดเจน
- BOM อ้าง SKU revision, Material revision และ conversion revision ที่แน่นอน รองรับสูตรย่อย/ของผลิตเอง และป้องกันวงจร
- ถ้าใช้ event/webhook ต้องมี idempotency, retry, error handling และการติดตามผล การเลือก REST/event/outbox ยังไม่ถูกตัดสิน
- ไม่เปิดให้ POS หรือโมดูลอื่นแก้ Master กลางข้าม approval workflow
- การแปลง snapshot เป็น Master จริงต้องผ่าน staging → ตรวจ → เสนอ → อนุมัติ ไม่ import เข้า published tables ทันที

## 9. ชิ้นงานและตำแหน่งไฟล์

Project root บนเครื่อง:

`/Users/Dear/Library/Mobile Documents/com~apple~CloudDocs/Documents/Claude/Projects`

| ชิ้นงาน | ตำแหน่งเทียบกับ Project root |
|---|---|
| POC ที่เปิดบนเครื่อง | `TKG-Master-Data-POC/` |
| หน้า Web | `TKG-Master-Data-POC/index.html` |
| UI / logic / pure filters | `style.css`, `app.js`, `core.js` ใน POC |
| ข้อมูลแสดงผล | `data.json` และ `data.js` ใน POC |
| Raw snapshots | `TKG-Master-Data-POC/source/` |
| ตัวสร้างข้อมูลจาก snapshot | `TKG-Master-Data-POC/build_data.py` |
| Wireframe ที่ CEO เคยเห็นชอบ (**เลิกใช้แล้ว** เก็บไว้อ้างอิงเท่านั้น) | `TKG-Master-Data-Proposal/TKG-Dashboard-HiFi.png` |
| Design system ที่ต้องยึด (อ่านอย่างเดียว) | `/Users/Dear/Claude/ICW-OS-DESIGN` (ตำแหน่งจริง ไม่ได้อยู่ใต้ Project root) |
| Presentation HTML | `TKG-Master-Data-Proposal/ceo-proposal.html` |
| Schema fields | `TKG-Master-Data-Proposal/Database-Structure-v1.1.md` |
| Schema แบบ JSON | `TKG-Master-Data-Proposal/database-structure.json` |
| Keynote พร้อม SKU Workflow | `TKG-Master-Data-Proposal/keynote-workflow/output/TKG-MasterData-HighLevel-Structure-with-SKU-Workflow.key` |
| โลโก้สำหรับ POC | `TKG-Master-Data-POC/assets/tkg-logo.png` |
| ภาพตรวจหน้าแรกหลังแก้ | `TKG-Master-Data-POC/.qa/overview-approved.png` |

ต้นฉบับโลโก้: `/Users/Dear/Library/CloudStorage/GoogleDrive-dear@icweb.co.th/Shared drives/Thonkrueng - Media/CI/Logo/TKG-Logo-Transparent.png`

Keynote ผู้ใช้ต้นฉบับ: `/Users/Dear/Desktop/TKG-MasterData-HighLevel-Structure.key`

### เปิดและตรวจ POC

เปิด `index.html` ได้โดยตรง หรือ serve โฟลเดอร์ POC ด้วย Python 3 HTTP server ที่ localhost port 8765 แล้วเข้า `http://127.0.0.1:8765/` URL นี้ใช้ได้เมื่อ server บนเครื่องกำลังทำงาน ไม่ใช่ hosting ถาวร

- `node test-data.cjs`: ตรวจ count, ID, crosswalk, OR/AND/unknown, category rollups, cancellation, POS joins
- `node check-wireframe.cjs`: ตรวจ Dashboard 3 การ์ด ไม่มีเมนูหมู, brand counts, Material/PORK filter, SKU count, mobile overflow และ JS errors — ส่วนที่ตรวจตาม Wireframe เดิมต้องปรับเมื่อเปลี่ยนเป็น ICW-OS-DESIGN
- Browser tests ผูก path Playwright/Chrome ของเครื่องผู้สร้าง ต้องปรับเมื่อย้ายเครื่อง
- `browser-check.cjs` เป็นชุดเก่าที่อ้างเมนูหมู ต้องปรับก่อนใช้ ไม่ใช่ acceptance test ปัจจุบัน
- `build_data.py` อ่าน raw snapshot ในเครื่อง ไม่ได้ refresh Google Sheets อัตโนมัติ

## 10. เรื่องที่ต้องตัดสินใจก่อน Dev จริง

1. Stack และ integration contract ของ OS: frontend/backend/database/SSO/hosting รวม Railway ว่ายังใช้หรือไม่
2. เจ้าของ Master และผู้อนุมัติจริงของแต่ละชนิดข้อมูล บทบาทส่วนกลาง/แบรนด์ การมอบหมายและ separation of duties
3. รูปแบบ TKG Material/SKU codes, UUID policy, code scope และ mapping กับ POS แต่ละสาขา
4. การรับรอง Material มาตรฐาน การแยกจากแพ็กซื้อ และหลักฐานใช้ทดแทนกันได้ ห้ามถือว่ารหัส Material ปัจจุบันคือ standardized concept ที่สะอาดแล้ว
5. การแก้ category code ที่หาย และการยืนยัน taxonomy / หมวดชิ้นส่วนหมู
6. หน่วยหลัก อัตราแปลง yield และผู้รับรองค่าที่วัด ห้าม derive ข้ามมิติโดยไม่มีหลักฐาน
7. สถานะ published/effective/retired, วันเริ่มใช้, การทบทวน BOM และวิธีรับทราบผลกระทบ
8. หน้าที่ของระบบปลายทางเมื่อ Master อนุมัติแล้ว แต่ POS ส่งไม่สำเร็จ/ยังไม่มี mapping
9. Data migration, import dedupe, กฎตรวจข้อมูล, cutover และช่วงหยุดแก้ Sheets
10. Backup/restore, audit retention, security, monitoring และข้อกำหนดปฏิบัติการขององค์กร
11. ขอบเขต POC/Production รอบถัดไปและเกณฑ์ให้ CEO อนุมัติ ยังไม่ใช่อนุมัติ deploy จากเอกสารนี้

## 11. ลำดับแนะนำสำหรับทีมรับช่วง

1. อ่านเอกสารนี้และศึกษา ICW-OS-DESIGN (design system และแอป FoodCost / Recipes / Purchasing / Supplier) ก่อนทำ UI
2. เปิด POC ตรวจ flow Material/SKU กับ raw snapshots และทดสอบข้อมูล
3. เทียบ model กับ OS ขององค์กร ลดการสร้างองค์กร/ผู้ใช้/สิทธิ์ซ้ำ
4. ตกลงประเด็นค้างและจัดทำ schema/constraints/API contracts ที่ตรวจ review ได้
5. แยก staging/published และทำ migration rehearsal โดยยังไม่แก้ข้อมูลต้นฉบับ
6. ทำ workflow และเชื่อม BOM/POS เป็นช่วง ๆ พร้อม acceptance criteria และ audit

### Context สั้นสำหรับส่งให้ AI หรือทีมใหม่

> พัฒนา TKG Master Data ต่อจาก local read-only POC โดย UI ยึด ICW-OS-DESIGN (github.com/ICW-AI/ICW-OS-DESIGN, อ่านอย่างเดียว) ไม่ใช้ CEO Wireframe หรือ TKG CI เดิม มี Material Master กลาง + Selling SKU แยก 4 แบรนด์ TK/HK/NT/OK เน้น Single Source of Truth, stable TKG IDs, external POS mapping, revisions, approval และ source provenance. Material ต้องแยก standard ingredient กับ purchase packs เมื่อผ่านการรับรองแล้ว; BOM อ้าง revision และรองรับสูตรย่อย. TRUE ใน Sheet = ระบุใช้, FALSE = ยังไม่ระบุ ไม่ใช่ห้ามใช้. ห้ามสร้างเมนูหมูแยก ให้เป็น Material filter. POC ไม่มี DB/API/Auth/Workflow จริงและไม่มี BOM. ข้อเสนอ 30 ตารางและ fields อยู่ภาคผนวก ต้องปรับให้เข้ากับ OS ก่อนทำ Production. อย่าแสดงยอดจาก Sheet ว่าอนุมัติแล้ว. Selling SKU ใกล้ final แต่ยังไม่ final อย่าเริ่ม cleansing/restructure ก่อนได้รับแจ้ง.

---

# ภาคผนวก: ข้อเสนอ Database Structure v1.1 พร้อม Fields

สำเนาจากไฟล์ข้อเสนอเดิมเพื่อให้ context ส่งต่อได้ในไฟล์เดียว สถานะยังเป็นข้อเสนอ ไม่ใช่ schema Production ที่ติดตั้งแล้ว

# TKG Master Data — Database Structure v1.1

ข้อเสนอเพื่ออนุมัติหลักการก่อน POC ยังไม่ใช่ DDL หรือฐานข้อมูลที่ติดตั้งแล้ว

**1 PostgreSQL Database / 6 กลุ่ม / 30 ตาราง** ไม่รวมสูตร BOM ราคา Supplier สต็อก หรือธุรกรรม

PK = รหัสหลัก, FK = รหัสเชื่อม, NULL = ยังไม่มีค่าได้, UNIQUE = ห้ามซ้ำ

ตารางธุรกิจและรุ่นข้อมูลทุกตารางยกเว้น entity_registry, audit_events, import_batches, import_rows เพิ่ม created_at (timestamptz) และ created_by (uuid FK users) เป็น Field กลาง ตาราง exception มีเวลา/ผู้กระทำเฉพาะของตนแล้ว

## กติกาการเชื่อมข้อมูล

- id ของ brands, branches, users, roles, category_schemes, categories, units, materials, purchase_items, item_conversions, selling_skus ลงทะเบียนใน entity_registry และเป็น FK ไป registry.id ด้วย การสร้างทำใน transaction เดียวกัน ตรวจ entity_type ให้ตรงตาราง
- current_revision_id ต้องชี้รุ่นอนุมัติของตัวตนเดียวกัน ใช้ constraint / transaction ตรวจให้ตรง
- ชุดหมวด SKU กลางและ Material ใช้ร่วมทั้งเครือ ส่วนหมวดเมนูผูกหนึ่งแบรนด์
- category_revisions.parent_revision_id ต้องอยู่ชุดหมวดและแบรนด์เดียวกัน ห้ามวงจร รุ่นเก่าเก็บไว้ เมื่อย้ายหมวดแม่ต้องตรวจหมวดลูกและการอ้างอิงก่อนเผยแพร่
- หมวดใน material_revisions / sku_revisions อ้างรุ่นหมวดที่อนุมัติจริง จึงตรวจประวัติชื่อและโครงสร้างหมวดได้
- Material แยก sourcing_type = purchased / produced และ material_group = ingredient / packaging / consumable หน่วยหลักระบุในรุ่น รายการซื้อเชื่อมได้เฉพาะชนิด purchased
- purchase_item_revisions.content_quantity คือปริมาณทั้งหมดในหนึ่ง purchase_unit เช่น 1 ลังมี 24 ขวด ขวดละ 330 มล. ให้ content_quantity = 7920, content_unit = ml เก็บรายละเอียดแพ็กใน pack_label หากต้องแปลงเป็นขวดเพิ่มค่ารายรายการที่อนุมัติ ไม่อนุมานจากข้อความ
- spec ที่ทดแทนกันไม่ได้ต้องแยก Material การยืนยันใช้แทนกันบันทึก substitution_evidence และผ่านส่วนกลางอนุมัติ
- หน่วยต้องมี dimension = mass / volume / count / package อัตราเป็นค่าบวก กก.เป็นกรัมใช้มาตรฐาน ค่าข้ามมิติต้องมีหลักฐานรายรายการ ห้ามเดาค่า
- standard_unit_conversions และหน่วยที่มีการใช้งานแล้วไม่แก้ความหมายเดิม ให้สร้างรายการใหม่ผ่านคำขออนุมัติและคงประวัติเดิม
- item_conversion_revisions อ้าง material revision และ purchase revision ที่ใช้วัดจริง หน่วยในคู่แปลงต้องตรงหน่วยที่อนุมัติ และแพ็กต้องเป็นของ Material เดียวกัน
- Material Brand Permission และ SKU Branch Listing เก็บเป็นช่วงเวลา effective_from / effective_to ห้ามช่วงทับซ้อนต่อคู่รายการ การเปลี่ยนต้องผ่านคำขอและ audit
- สาขาต้องอยู่แบรนด์เดียวกับ SKU, SKU code ไม่ซ้ำภายในแบรนด์, branch code ไม่ซ้ำภายในแบรนด์, category code ไม่ซ้ำภายในชุดหมวด
- source_scope ระบุขอบเขตรหัสต้นทาง เช่น POS:NT:PATTANAKARN รหัสภายนอกต้องไม่ซ้ำใน system_id + source_scope ณ ช่วงเวลาเดียวกัน ไม่ใช้ external code เป็น PK
- entity_registry อ้างได้เฉพาะตัวตนที่ลงทะเบียนจริง ไม่ใช่การเก็บข้อมูล Master ทั้งหมดใน JSON
- roles.permission_codes เป็นชุดสิทธิ์ที่โปรแกรมรองรับ การมองเห็นต้องตรวจ role และ user_brand_scopes ร่วมกัน scope_type = all_brands ใช้ brand_id ว่างได้ เฉพาะผู้มีอำนาจส่วนกลาง
- ผู้เสนอไม่อนุมัติคำขอตนเอง คำขอหลายรายการอนุมัติเป็นชุดเดียว ถ้ารายการใดไม่ผ่านให้ส่งกลับทั้งชุดก่อน แยกคำขอเมื่ออยากอนุมัติบางส่วน
- Approved revision แก้ทับไม่ได้ base_revision_no ใช้ป้องกันคำขอชนกัน การอนุมัติเผยแพร่ทุกส่วนใน transaction เดียว
- Draft payload เก็บพักใน change_request_items.proposed_payload หลังอนุมัติจึงบันทึก typed fields ลงตาราง Master/Revision JSON ใช้เฉพาะข้อมูลพัก หลักฐาน และประวัติ
- เลิกใช้แทนลบรายการที่ถูกอ้างอิง ห้ามนำรหัสเดิมไปใช้กับตัวตนอื่น
- raw_payload เก็บทุกคอลัมน์เดิมเพื่อย้อนตรวจ ข้อมูล Supplier/คลัง/ราคาในต้นฉบับยังไม่กลายเป็นส่วนงาน Master ที่เปิดบริหาร
- จำนวน 30 ตารางเป็นข้อเสนอสำหรับคุยและประเมิน POC อาจปรับหลังตรวจข้อมูลทุกแถว และยังต้องกำหนด nullability/enum/index/retention รายละเอียดก่อน Dev

## จุดเชื่อม BOM ในอนาคต

BOM ต้องอ้าง SKU revision, Material revision และ conversion revision ที่แน่นอน มีสูตรย่อย/ผลผลิต และห้ามวงจร ข้อมูลผลกระทบใน POC ใช้ reference จำลองก่อน ระบบจริงต้องเพิ่มตารางสูตร รายการส่วนประกอบ และการอ้างอิงโดยแยก scope ไม่รวมใน 30 ตารางนี้

## 01. brands — แบรนด์ในเครือ

กลุ่ม: องค์กรและสิทธิ์

| Field | Type / Key |
|---|---|
| id | uuid PK |
| code | text UNIQUE |
| name_th | text |
| name_en | text |
| status | enum |

## 02. branches — สาขาของแต่ละแบรนด์

กลุ่ม: องค์กรและสิทธิ์

| Field | Type / Key |
|---|---|
| id | uuid PK |
| brand_id | uuid FK |
| code | text |
| name_th | text |
| name_en | text |
| status | enum |

## 03. users — บัญชีผู้ใช้งาน

กลุ่ม: องค์กรและสิทธิ์

| Field | Type / Key |
|---|---|
| id | uuid PK |
| auth_subject | text UNIQUE |
| email | text UNIQUE |
| display_name | text |
| status | enum |

## 04. roles — บทบาทและสิทธิ์การทำงาน

กลุ่ม: องค์กรและสิทธิ์

| Field | Type / Key |
|---|---|
| id | uuid PK |
| code | text UNIQUE |
| name | text |
| permission_codes | jsonb |
| status | enum |

## 05. user_roles — บทบาทที่แต่ละคนได้รับ

กลุ่ม: องค์กรและสิทธิ์

| Field | Type / Key |
|---|---|
| id | uuid PK |
| user_id | uuid FK |
| role_id | uuid FK |
| valid_from | timestamptz |
| valid_to | timestamptz NULL |

## 06. user_brand_scopes — ขอบเขตแบรนด์ของผู้ใช้

กลุ่ม: องค์กรและสิทธิ์

| Field | Type / Key |
|---|---|
| id | uuid PK |
| user_id | uuid FK |
| brand_id | uuid FK NULL |
| scope_type | enum |
| valid_from | timestamptz |
| valid_to | timestamptz NULL |

## 07. category_schemes — ชุดหมวด Material / SKU / เมนูแบรนด์

กลุ่ม: หมวดและหน่วย

| Field | Type / Key |
|---|---|
| id | uuid PK |
| code | text UNIQUE |
| scheme_type | enum |
| brand_id | uuid FK NULL |
| name_th | text |
| name_en | text |
| status | enum |

## 08. categories — ตัวตนถาวรของหมวด

กลุ่ม: หมวดและหน่วย

| Field | Type / Key |
|---|---|
| id | uuid PK |
| scheme_id | uuid FK |
| code | text |
| current_revision_id | uuid FK NULL |

## 09. category_revisions — ชื่อและลำดับหมวดแต่ละรุ่น

กลุ่ม: หมวดและหน่วย

| Field | Type / Key |
|---|---|
| id | uuid PK |
| category_id | uuid FK |
| revision_no | integer |
| name_th | text |
| name_en | text |
| parent_revision_id | uuid FK NULL |
| sort_order | integer |
| status | enum |
| change_request_id | uuid FK |

## 10. units — หน่วยนับและมิติของหน่วย

กลุ่ม: หมวดและหน่วย

| Field | Type / Key |
|---|---|
| id | uuid PK |
| code | text UNIQUE |
| name_th | text |
| name_en | text |
| dimension | enum |
| status | enum |

## 11. standard_unit_conversions — อัตรามาตรฐาน เช่น กิโลกรัมเป็นกรัม

กลุ่ม: หมวดและหน่วย

| Field | Type / Key |
|---|---|
| id | uuid PK |
| from_unit_id | uuid FK |
| to_unit_id | uuid FK |
| factor | numeric(20,8) |
| status | enum |

## 12. materials — ตัวตนถาวรของวัตถุดิบและของผลิตเอง

กลุ่ม: Material Master

| Field | Type / Key |
|---|---|
| id | uuid PK |
| code | text UNIQUE |
| current_revision_id | uuid FK NULL |

## 13. material_revisions — รายละเอียดวัตถุดิบแต่ละรุ่น

กลุ่ม: Material Master

| Field | Type / Key |
|---|---|
| id | uuid PK |
| material_id | uuid FK |
| revision_no | integer |
| name_th | text |
| name_en | text |
| sourcing_type | enum |
| material_group | enum |
| specification | text |
| base_unit_id | uuid FK |
| category_revision_id | uuid FK |
| bom_eligible | boolean |
| status | enum |
| change_request_id | uuid FK |

## 14. purchase_items — ตัวตนถาวรของรายการซื้อ

กลุ่ม: Material Master

| Field | Type / Key |
|---|---|
| id | uuid PK |
| code | text UNIQUE |
| material_id | uuid FK |
| current_revision_id | uuid FK NULL |

## 15. purchase_item_revisions — ยี่ห้อและแพ็กซื้อแต่ละรุ่น

กลุ่ม: Material Master

| Field | Type / Key |
|---|---|
| id | uuid PK |
| purchase_item_id | uuid FK |
| revision_no | integer |
| brand_name | text NULL |
| model | text NULL |
| pack_label | text |
| purchase_unit_id | uuid FK |
| content_quantity | numeric(20,8) |
| content_unit_id | uuid FK |
| substitution_evidence | text |
| status | enum |
| change_request_id | uuid FK |

## 16. material_brand_permissions — วัตถุดิบที่แต่ละแบรนด์ใช้ได้

กลุ่ม: Material Master

| Field | Type / Key |
|---|---|
| id | uuid PK |
| material_id | uuid FK |
| brand_id | uuid FK |
| is_allowed | boolean |
| effective_from | timestamptz |
| effective_to | timestamptz NULL |
| change_request_id | uuid FK |

## 17. item_conversions — ตัวตนของค่าการแปลงเฉพาะรายการ

กลุ่ม: Material Master

| Field | Type / Key |
|---|---|
| id | uuid PK |
| material_id | uuid FK |
| purchase_item_id | uuid FK NULL |
| from_unit_id | uuid FK |
| to_unit_id | uuid FK |
| current_revision_id | uuid FK NULL |

## 18. item_conversion_revisions — ค่าที่วัดและอนุมัติในแต่ละรุ่น

กลุ่ม: Material Master

| Field | Type / Key |
|---|---|
| id | uuid PK |
| conversion_id | uuid FK |
| revision_no | integer |
| factor | numeric(20,8) |
| material_revision_id | uuid FK |
| purchase_item_revision_id | uuid FK NULL |
| measurement_basis | text |
| evidence_uri | text NULL |
| status | enum |
| change_request_id | uuid FK |

## 19. selling_skus — ตัวตนถาวรของ SKU แยกแบรนด์

กลุ่ม: Selling SKU Master

| Field | Type / Key |
|---|---|
| id | uuid PK |
| brand_id | uuid FK |
| code | text |
| current_revision_id | uuid FK NULL |

## 20. sku_revisions — ชื่อ รูปแบบขาย และหมวดแต่ละรุ่น

กลุ่ม: Selling SKU Master

| Field | Type / Key |
|---|---|
| id | uuid PK |
| sku_id | uuid FK |
| revision_no | integer |
| name_th | text |
| name_en | text |
| selling_format | text |
| sales_unit_id | uuid FK |
| central_category_rev_id | uuid FK |
| menu_category_rev_id | uuid FK NULL |
| status | enum |
| change_request_id | uuid FK |

## 21. sku_branch_listings — การเปิดขาย SKU ในแต่ละสาขา

กลุ่ม: Selling SKU Master

| Field | Type / Key |
|---|---|
| id | uuid PK |
| sku_id | uuid FK |
| branch_id | uuid FK |
| is_enabled | boolean |
| effective_from | timestamptz |
| effective_to | timestamptz NULL |
| change_request_id | uuid FK |

## 22. entity_registry — ทะเบียนรหัสถาวรสำหรับเชื่อมข้ามโมดูล

กลุ่ม: รหัสเชื่อมต่อ

| Field | Type / Key |
|---|---|
| id | uuid PK |
| entity_type | enum |
| registered_at | timestamptz |

## 23. external_systems — ระบบต้นทาง เช่น Sheets หรือ POS

กลุ่ม: รหัสเชื่อมต่อ

| Field | Type / Key |
|---|---|
| id | uuid PK |
| code | text UNIQUE |
| name | text |
| system_type | enum |
| status | enum |

## 24. external_identifiers — เทียบรหัสกลางกับรหัสเดิมหรือ POS

กลุ่ม: รหัสเชื่อมต่อ

| Field | Type / Key |
|---|---|
| id | uuid PK |
| system_id | uuid FK |
| entity_id | uuid FK |
| source_scope | text |
| external_code | text |
| is_primary | boolean |
| valid_from | timestamptz |
| valid_to | timestamptz NULL |
| import_row_id | uuid FK NULL |

## 25. change_requests — หัวคำขอเพิ่ม แก้ไข หรือเลิกใช้

กลุ่ม: อนุมัติและนำเข้า

| Field | Type / Key |
|---|---|
| id | uuid PK |
| request_no | text UNIQUE |
| submitted_by | uuid FK |
| reason | text |
| status | enum |
| submitted_at | timestamptz NULL |
| resolved_at | timestamptz NULL |

## 26. change_request_items — รายการเปลี่ยนและรุ่นฐานที่ตรวจเทียบ

กลุ่ม: อนุมัติและนำเข้า

| Field | Type / Key |
|---|---|
| id | uuid PK |
| request_id | uuid FK |
| target_entity_id | uuid FK |
| operation | enum |
| base_revision_no | integer NULL |
| proposed_payload | jsonb |
| impact_summary | jsonb |
| validation_status | enum |

## 27. approval_decisions — ผลพิจารณาของผู้อนุมัติ

กลุ่ม: อนุมัติและนำเข้า

| Field | Type / Key |
|---|---|
| id | uuid PK |
| request_id | uuid FK |
| reviewer_id | uuid FK |
| decision | enum |
| comment | text NULL |
| decided_at | timestamptz |

## 28. audit_events — บันทึกเหตุการณ์ที่แก้ทับไม่ได้

กลุ่ม: อนุมัติและนำเข้า

| Field | Type / Key |
|---|---|
| id | uuid PK |
| target_entity_id | uuid FK NULL |
| request_id | uuid FK NULL |
| actor_id | uuid FK |
| action | text |
| before_data | jsonb NULL |
| after_data | jsonb NULL |
| occurred_at | timestamptz |

## 29. import_batches — รอบนำเข้าและต้นฉบับที่เก็บไว้

กลุ่ม: อนุมัติและนำเข้า

| Field | Type / Key |
|---|---|
| id | uuid PK |
| source_uri | text |
| source_hash | text |
| mapping_version | text |
| imported_by | uuid FK |
| status | enum |
| request_id | uuid FK NULL |
| imported_at | timestamptz |

## 30. import_rows — แต่ละแถวต้นทางและผลตรวจ

กลุ่ม: อนุมัติและนำเข้า

| Field | Type / Key |
|---|---|
| id | uuid PK |
| batch_id | uuid FK |
| source_tab | text |
| source_row_no | integer |
| raw_payload | jsonb |
| normalized_payload | jsonb |
| validation_errors | jsonb |
| matched_entity_id | uuid FK NULL |
| status | enum |

