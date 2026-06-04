-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('USER', 'SUPER_ADMIN');

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "platformRole" "PlatformRole" NOT NULL DEFAULT 'USER';
