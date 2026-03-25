-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prayer_settings" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "global_buffer_minutes" INTEGER NOT NULL DEFAULT 20,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "city_name" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "auto_detect_location" BOOLEAN NOT NULL DEFAULT true,
    "calculation_method" TEXT NOT NULL DEFAULT 'mwl',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prayer_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_prayer_schedules" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "prayer_name" TEXT NOT NULL,
    "scheduled_adzan_time" TIMESTAMP(3) NOT NULL,
    "calculation_method" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_prayer_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prayer_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "prayer_name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "check_in_timestamp" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "buffer_snapshot_minutes" INTEGER NOT NULL,
    "adzan_snapshot_time" TIMESTAMP(3) NOT NULL,
    "response_time_minutes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prayer_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "auth_tokens_token_hash_key" ON "auth_tokens"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "prayer_settings_user_id_key" ON "prayer_settings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_prayer_schedules_user_id_date_prayer_name_key" ON "daily_prayer_schedules"("user_id", "date", "prayer_name");

-- CreateIndex
CREATE UNIQUE INDEX "prayer_logs_user_id_date_prayer_name_key" ON "prayer_logs"("user_id", "date", "prayer_name");

-- AddForeignKey
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_settings" ADD CONSTRAINT "prayer_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_prayer_schedules" ADD CONSTRAINT "daily_prayer_schedules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_logs" ADD CONSTRAINT "prayer_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
