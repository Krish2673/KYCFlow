-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "reviewerId" TEXT;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
