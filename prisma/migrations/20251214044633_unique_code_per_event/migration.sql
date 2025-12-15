/*
  Warnings:

  - A unique constraint covering the columns `[event_id,code]` on the table `guests` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "guests_code_key";

-- CreateIndex
CREATE UNIQUE INDEX "guests_event_id_code_key" ON "guests"("event_id", "code");
