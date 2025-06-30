-- CreateTable
CREATE TABLE "family_invitations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyId" TEXT NOT NULL,
    "inviterUserId" TEXT NOT NULL,
    "invitedEmail" TEXT,
    "invitedUsername" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" DATETIME,
    CONSTRAINT "family_invitations_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "families" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "family_invitations_inviterUserId_fkey" FOREIGN KEY ("inviterUserId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
