-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_sizes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "base_price" DECIMAL(8,2) NOT NULL,
    "servings_min" INTEGER,
    "servings_max" INTEGER,
    "description" TEXT,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_flavors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_flavors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_fillings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price_addon" DECIMAL(8,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_fillings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_toppers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price_addon" DECIMAL(8,2) NOT NULL,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_toppers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "size_id" TEXT NOT NULL,
    "flavor_id" TEXT NOT NULL,
    "filling_id" TEXT NOT NULL,
    "base_price" DECIMAL(8,2) NOT NULL,
    "customization_total" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "total_price" DECIMAL(8,2) NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pickup_date" DATE NOT NULL,
    "pickup_time" TIME NOT NULL DEFAULT '12:00:00'::time,
    "payment_due_date" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "payment_status" TEXT NOT NULL DEFAULT 'unpaid',
    "allergies_restrictions" TEXT,
    "special_requests" TEXT,
    "recipient_phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_customizations" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "topper_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price_at_time" DECIMAL(8,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_customizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "action" TEXT,
    "old_values" JSONB,
    "new_values" JSONB,
    "user_id" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_sizes_name_key" ON "catalog_sizes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_flavors_name_key" ON "catalog_flavors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_fillings_name_key" ON "catalog_fillings"("name");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_toppers_name_key" ON "catalog_toppers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_customer_id_idx" ON "orders"("customer_id");

-- CreateIndex
CREATE INDEX "orders_pickup_date_idx" ON "orders"("pickup_date");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_payment_status_idx" ON "orders"("payment_status");

-- CreateIndex
CREATE INDEX "order_customizations_order_id_idx" ON "order_customizations"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "admin_users_email_idx" ON "admin_users"("email");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "catalog_sizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_flavor_id_fkey" FOREIGN KEY ("flavor_id") REFERENCES "catalog_flavors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_filling_id_fkey" FOREIGN KEY ("filling_id") REFERENCES "catalog_fillings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_customizations" ADD CONSTRAINT "order_customizations_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_customizations" ADD CONSTRAINT "order_customizations_topper_id_fkey" FOREIGN KEY ("topper_id") REFERENCES "catalog_toppers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
