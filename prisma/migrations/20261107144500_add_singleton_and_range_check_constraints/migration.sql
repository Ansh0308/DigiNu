-- AlterTable: Add CHECK constraint to enforce fixed singleton key on restaurant_profile
ALTER TABLE "restaurant_profile" 
ADD CONSTRAINT "restaurant_profile_singleton_check" 
CHECK ("singletonKey" = 'RESTAURANT_PROFILE_SINGLETON');

-- AlterTable: Add CHECK constraint to enforce fixed singleton key on owner_account (1-owner MVP invariant)
ALTER TABLE "owner_account" 
ADD CONSTRAINT "owner_account_singleton_check" 
CHECK ("singletonKey" = 'OWNER_ACCOUNT_SINGLETON');

-- AlterTable: Add CHECK constraint to enforce fixed singleton key on qr_code_config
ALTER TABLE "qr_code_config" 
ADD CONSTRAINT "qr_code_config_singleton_check" 
CHECK ("singletonKey" = 'QR_CODE_CONFIG_SINGLETON');

-- AlterTable: Add CHECK constraint to enforce dayOfWeek between 0 (Sunday) and 6 (Saturday)
ALTER TABLE "operating_hours" 
ADD CONSTRAINT "operating_hours_dayofweek_range_check" 
CHECK ("dayOfWeek" >= 0 AND "dayOfWeek" <= 6);

