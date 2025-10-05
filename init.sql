-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "recNo" INTEGER NOT NULL,
    "givenName" TEXT,
    "familyName" TEXT,
    "gender" TEXT,
    "dob" TIMESTAMP(3),
    "dod" TIMESTAMP(3),
    "dobHijri" TEXT,
    "dodHijri" TEXT,
    "country" TEXT,
    "education" TEXT,
    "occupation" TEXT,
    "buried" TEXT,
    "honour" TEXT,
    "alive" BOOLEAN,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentChild" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,

    CONSTRAINT "ParentChild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marriage" (
    "id" TEXT NOT NULL,
    "aId" TEXT NOT NULL,
    "bId" TEXT NOT NULL,
    "start" TIMESTAMP(3),
    "end" TIMESTAMP(3),
    "nikahType" TEXT,
    "notes" TEXT,

    CONSTRAINT "Marriage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Person_recNo_key" ON "Person"("recNo");

-- CreateIndex
CREATE INDEX "Person_familyName_givenName_idx" ON "Person"("familyName", "givenName");

-- CreateIndex
CREATE UNIQUE INDEX "ParentChild_parentId_childId_key" ON "ParentChild"("parentId", "childId");

-- CreateIndex
CREATE INDEX "Marriage_aId_idx" ON "Marriage"("aId");

-- CreateIndex
CREATE INDEX "Marriage_bId_idx" ON "Marriage"("bId");

-- CreateIndex
CREATE UNIQUE INDEX "Marriage_aId_bId_start_key" ON "Marriage"("aId", "bId", "start");

-- AddForeignKey
ALTER TABLE "ParentChild" ADD CONSTRAINT "ParentChild_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentChild" ADD CONSTRAINT "ParentChild_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marriage" ADD CONSTRAINT "Marriage_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marriage" ADD CONSTRAINT "Marriage_bId_fkey" FOREIGN KEY ("bId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

