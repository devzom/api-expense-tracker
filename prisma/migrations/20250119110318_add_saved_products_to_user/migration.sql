-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('WEEKLY_SUMMARY', 'MONTHLY_SUMMARY', 'CATEGORY_BREAKDOWN');

-- CreateEnum
CREATE TYPE "Schedule" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "saved_reports" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "filters" JSONB,
    "schedule" "Schedule",
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "saved_reports" ADD CONSTRAINT "saved_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
