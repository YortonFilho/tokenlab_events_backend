-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_eventId_fkey";

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
