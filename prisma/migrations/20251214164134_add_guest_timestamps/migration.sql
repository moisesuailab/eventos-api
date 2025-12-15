-- AlterTable
ALTER TABLE "guests" ADD COLUMN     "checked_in" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "checked_in_at" TIMESTAMP(3),
ADD COLUMN     "responded_at" TIMESTAMP(3);
