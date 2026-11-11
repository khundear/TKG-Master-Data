-- CreateEnum
CREATE TYPE "record_status" AS ENUM ('draft', 'approved', 'retired');

-- CreateEnum
CREATE TYPE "brand_usage" AS ENUM ('used', 'not_used');

-- CreateEnum
CREATE TYPE "import_status" AS ENUM ('running', 'completed', 'failed');

-- CreateTable
CREATE TABLE "import_batches" (
    "id" UUID NOT NULL,
    "source_file" TEXT NOT NULL,
    "source_hash" TEXT NOT NULL,
    "mapping_version" TEXT NOT NULL,
    "status" "import_status" NOT NULL DEFAULT 'running',
    "summary" JSONB,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ(6),

    CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_rows" (
    "id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "sheet" TEXT NOT NULL,
    "row_no" INTEGER NOT NULL,
    "raw" JSONB NOT NULL,

    CONSTRAINT "import_rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name_th" TEXT NOT NULL,
    "name_en" TEXT,
    "status" "record_status" NOT NULL DEFAULT 'draft',

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stores" (
    "id" UUID NOT NULL,
    "brand_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "status" "record_status" NOT NULL DEFAULT 'draft',
    "import_batch_id" UUID,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_categories" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "group" TEXT NOT NULL,
    "primary_code" TEXT,
    "secondary_code" TEXT,
    "tertiary_code" TEXT,
    "name_th" TEXT,
    "parent_id" UUID,
    "sort_order" INTEGER NOT NULL,
    "sheet_classified" INTEGER,
    "sheet_pending" INTEGER,
    "status" "record_status" NOT NULL DEFAULT 'draft',
    "import_batch_id" UUID NOT NULL,
    "source_sheet" TEXT NOT NULL,
    "source_row" INTEGER NOT NULL,

    CONSTRAINT "material_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name_th" TEXT,
    "label" TEXT NOT NULL,
    "status" "record_status" NOT NULL DEFAULT 'draft',
    "import_batch_id" UUID,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "legacy_code" TEXT NOT NULL,
    "id_change" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "kind" TEXT,
    "group" TEXT,
    "primary_category" TEXT,
    "secondary_category" TEXT,
    "tertiary_category" TEXT,
    "proposed_category_code" TEXT,
    "proposed_category_name_th" TEXT,
    "current_category_name" TEXT,
    "current_category_code" TEXT,
    "bible_code" TEXT,
    "category_id" UUID,
    "mapping_status" TEXT NOT NULL,
    "is_cancelled" BOOLEAN NOT NULL DEFAULT false,
    "mapping_note" TEXT,
    "crosswalk_flag" TEXT,
    "crosswalk_evidence" TEXT,
    "unit_label" TEXT,
    "unit_id" UUID,
    "storage_temperature" TEXT,
    "status" "record_status" NOT NULL DEFAULT 'draft',
    "import_batch_id" UUID NOT NULL,
    "source_sheet" TEXT NOT NULL,
    "source_row" INTEGER NOT NULL,
    "crosswalk_row" INTEGER,
    "brand_sheet_row" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_brand_usages" (
    "id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "brand_id" UUID NOT NULL,
    "usage" "brand_usage" NOT NULL,
    "status" "record_status" NOT NULL DEFAULT 'draft',
    "import_batch_id" UUID,
    "source_sheet" TEXT,
    "source_row" INTEGER,

    CONSTRAINT "material_brand_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sku_categories" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "name_en" TEXT,
    "name_th" TEXT,
    "parent_id" UUID,
    "sort_order" INTEGER NOT NULL,
    "status" "record_status" NOT NULL DEFAULT 'draft',
    "import_batch_id" UUID NOT NULL,
    "source_sheet" TEXT NOT NULL,
    "source_row" INTEGER NOT NULL,

    CONSTRAINT "sku_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_menu_categories" (
    "id" UUID NOT NULL,
    "brand_id" UUID NOT NULL,
    "type" TEXT,
    "menu_category" TEXT,
    "category_full" TEXT,
    "subcategory" TEXT,
    "subcategory_full" TEXT,
    "prefix" TEXT,
    "sort_order" INTEGER NOT NULL,
    "status" "record_status" NOT NULL DEFAULT 'draft',
    "import_batch_id" UUID NOT NULL,
    "source_sheet" TEXT NOT NULL,
    "source_row" INTEGER NOT NULL,

    CONSTRAINT "brand_menu_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "selling_skus" (
    "id" UUID NOT NULL,
    "master_record_key" TEXT NOT NULL,
    "tkg_code" TEXT,
    "brand_id" UUID NOT NULL,
    "name_en" TEXT,
    "name_th" TEXT,
    "l1" TEXT,
    "l2_en" TEXT,
    "l2_th" TEXT,
    "l3_en" TEXT,
    "l3_th" TEXT,
    "category_code" TEXT,
    "central_category_id" UUID,
    "brand_menu_category" TEXT,
    "brand_menu_subcategory" TEXT,
    "review_note" TEXT,
    "sheet_brand_flags" TEXT[],
    "status" "record_status" NOT NULL DEFAULT 'draft',
    "import_batch_id" UUID NOT NULL,
    "source_sheet" TEXT NOT NULL,
    "source_row" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "selling_skus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos_mappings" (
    "id" UUID NOT NULL,
    "sku_id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "pos_sku_code" TEXT,
    "pos_internal_id" TEXT,
    "pos_label" TEXT,
    "pos_group" TEXT,
    "pos_category" TEXT,
    "price" DECIMAL(12,2),
    "sales_status" TEXT,
    "present_in_pos" BOOLEAN,
    "ready_to_sell" BOOLEAN,
    "snapshot_date" DATE,
    "source_url" TEXT,
    "status" "record_status" NOT NULL DEFAULT 'draft',
    "import_batch_id" UUID NOT NULL,
    "source_sheet" TEXT NOT NULL,
    "source_row" INTEGER NOT NULL,

    CONSTRAINT "pos_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "import_rows_batch_id_sheet_row_no_key" ON "import_rows"("batch_id", "sheet", "row_no");

-- CreateIndex
CREATE UNIQUE INDEX "brands_code_key" ON "brands"("code");

-- CreateIndex
CREATE UNIQUE INDEX "stores_brand_id_name_key" ON "stores"("brand_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "material_categories_code_key" ON "material_categories"("code");

-- CreateIndex
CREATE INDEX "material_categories_parent_id_idx" ON "material_categories"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "units_code_key" ON "units"("code");

-- CreateIndex
CREATE UNIQUE INDEX "materials_code_key" ON "materials"("code");

-- CreateIndex
CREATE UNIQUE INDEX "materials_legacy_code_key" ON "materials"("legacy_code");

-- CreateIndex
CREATE INDEX "materials_group_idx" ON "materials"("group");

-- CreateIndex
CREATE INDEX "materials_mapping_status_idx" ON "materials"("mapping_status");

-- CreateIndex
CREATE INDEX "materials_bible_code_idx" ON "materials"("bible_code");

-- CreateIndex
CREATE INDEX "material_brand_usages_brand_id_usage_idx" ON "material_brand_usages"("brand_id", "usage");

-- CreateIndex
CREATE UNIQUE INDEX "material_brand_usages_material_id_brand_id_key" ON "material_brand_usages"("material_id", "brand_id");

-- CreateIndex
CREATE UNIQUE INDEX "sku_categories_code_key" ON "sku_categories"("code");

-- CreateIndex
CREATE INDEX "sku_categories_parent_id_idx" ON "sku_categories"("parent_id");

-- CreateIndex
CREATE INDEX "brand_menu_categories_brand_id_idx" ON "brand_menu_categories"("brand_id");

-- CreateIndex
CREATE UNIQUE INDEX "selling_skus_master_record_key_key" ON "selling_skus"("master_record_key");

-- CreateIndex
CREATE UNIQUE INDEX "selling_skus_tkg_code_key" ON "selling_skus"("tkg_code");

-- CreateIndex
CREATE INDEX "selling_skus_brand_id_idx" ON "selling_skus"("brand_id");

-- CreateIndex
CREATE INDEX "pos_mappings_sku_id_idx" ON "pos_mappings"("sku_id");

-- CreateIndex
CREATE INDEX "pos_mappings_pos_sku_code_idx" ON "pos_mappings"("pos_sku_code");

-- CreateIndex
CREATE UNIQUE INDEX "pos_mappings_store_id_pos_internal_id_key" ON "pos_mappings"("store_id", "pos_internal_id");

-- AddForeignKey
ALTER TABLE "import_rows" ADD CONSTRAINT "import_rows_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "import_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_categories" ADD CONSTRAINT "material_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "material_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_categories" ADD CONSTRAINT "material_categories_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "import_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "import_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "material_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "import_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_brand_usages" ADD CONSTRAINT "material_brand_usages_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_brand_usages" ADD CONSTRAINT "material_brand_usages_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_brand_usages" ADD CONSTRAINT "material_brand_usages_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "import_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sku_categories" ADD CONSTRAINT "sku_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "sku_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sku_categories" ADD CONSTRAINT "sku_categories_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "import_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_menu_categories" ADD CONSTRAINT "brand_menu_categories_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_menu_categories" ADD CONSTRAINT "brand_menu_categories_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "import_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selling_skus" ADD CONSTRAINT "selling_skus_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selling_skus" ADD CONSTRAINT "selling_skus_central_category_id_fkey" FOREIGN KEY ("central_category_id") REFERENCES "sku_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selling_skus" ADD CONSTRAINT "selling_skus_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "import_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_mappings" ADD CONSTRAINT "pos_mappings_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "selling_skus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_mappings" ADD CONSTRAINT "pos_mappings_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_mappings" ADD CONSTRAINT "pos_mappings_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "import_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
