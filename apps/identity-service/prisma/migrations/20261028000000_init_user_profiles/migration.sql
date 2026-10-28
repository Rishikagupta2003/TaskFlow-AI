-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "bio" TEXT,
    "preferences" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_email_key" ON "user_profiles"("email");
