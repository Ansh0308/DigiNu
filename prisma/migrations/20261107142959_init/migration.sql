-- CreateTable
CREATE TABLE "restaurant_profile" (
    "id" TEXT NOT NULL,
    "singletonKey" VARCHAR(30) NOT NULL DEFAULT 'RESTAURANT_PROFILE_SINGLETON',
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(60) NOT NULL,
    "tagline" VARCHAR(160),
    "aboutStory" TEXT,
    "address" VARCHAR(255),
    "phone" VARCHAR(30),
    "whatsapp" VARCHAR(30),
    "currencyCode" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "currencySymbol" VARCHAR(5) NOT NULL DEFAULT '$',
    "currencyPosition" VARCHAR(6) NOT NULL DEFAULT 'PREFIX',
    "themePreset" VARCHAR(30) NOT NULL DEFAULT 'warm-cream',
    "primaryColor" VARCHAR(7) NOT NULL DEFAULT '#C85A32',
    "accentColor" VARCHAR(7) NOT NULL DEFAULT '#F59E0B',
    "logoAssetId" TEXT,
    "bannerAssetId" TEXT,
    "aiCreditsBalance" INTEGER NOT NULL DEFAULT 30,
    "aiCreditsMonthlyLimit" INTEGER NOT NULL DEFAULT 30,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owner_account" (
    "id" TEXT NOT NULL,
    "singletonKey" VARCHAR(30) NOT NULL DEFAULT 'OWNER_ACCOUNT_SINGLETON',
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "fullName" VARCHAR(100) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owner_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_categories" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "subtitle" VARCHAR(160),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "shortDescription" VARCHAR(180),
    "detailedDescription" TEXT,
    "price" DECIMAL(8,2) NOT NULL,
    "isVegetarian" BOOLEAN NOT NULL DEFAULT false,
    "dietaryFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allergenFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "imageAssetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "fileId" VARCHAR(100) NOT NULL,
    "filePath" VARCHAR(255) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "assetType" VARCHAR(30) NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "originalFilename" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operating_hours" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" VARCHAR(5) NOT NULL DEFAULT '11:00',
    "closeTime" VARCHAR(5) NOT NULL DEFAULT '22:00',
    "isClosed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "operating_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_code_config" (
    "id" TEXT NOT NULL,
    "singletonKey" VARCHAR(30) NOT NULL DEFAULT 'QR_CODE_CONFIG_SINGLETON',
    "foregroundColor" VARCHAR(7) NOT NULL DEFAULT '#000000',
    "embedLogo" BOOLEAN NOT NULL DEFAULT true,
    "dotStyle" VARCHAR(20) NOT NULL DEFAULT 'rounded',
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qr_code_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_generation_logs" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "promptSynthesized" TEXT NOT NULL,
    "providerModel" VARCHAR(60) NOT NULL,
    "neuronsConsumed" INTEGER NOT NULL DEFAULT 250,
    "selectedAssetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_generation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_profile_singletonKey_key" ON "restaurant_profile"("singletonKey");

-- CreateIndex
CREATE UNIQUE INDEX "owner_account_singletonKey_key" ON "owner_account"("singletonKey");

-- CreateIndex
CREATE UNIQUE INDEX "owner_account_email_key" ON "owner_account"("email");

-- CreateIndex
CREATE INDEX "idx_categories_display" ON "menu_categories"("isActive", "displayOrder");

-- CreateIndex
CREATE INDEX "idx_menu_items_display" ON "menu_items"("categoryId", "isVisible", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_fileId_key" ON "media_assets"("fileId");

-- CreateIndex
CREATE INDEX "idx_media_assets_type" ON "media_assets"("assetType");

-- CreateIndex
CREATE UNIQUE INDEX "operating_hours_dayOfWeek_key" ON "operating_hours"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "qr_code_config_singletonKey_key" ON "qr_code_config"("singletonKey");

-- CreateIndex
CREATE INDEX "idx_ai_logs_created" ON "ai_generation_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "restaurant_profile" ADD CONSTRAINT "restaurant_profile_logoAssetId_fkey" FOREIGN KEY ("logoAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_profile" ADD CONSTRAINT "restaurant_profile_bannerAssetId_fkey" FOREIGN KEY ("bannerAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "menu_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_imageAssetId_fkey" FOREIGN KEY ("imageAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_generation_logs" ADD CONSTRAINT "ai_generation_logs_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_generation_logs" ADD CONSTRAINT "ai_generation_logs_selectedAssetId_fkey" FOREIGN KEY ("selectedAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
