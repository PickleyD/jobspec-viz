-- CreateTable
CREATE TABLE "job_spec_version" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "job_spec" INT8 NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "name" STRING,
    "description" STRING,
    "content" JSONB,
    "created_by" STRING NOT NULL,

    CONSTRAINT "job_spec_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_spec" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" STRING NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "job_spec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "address" STRING NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "name" STRING,
    "num_logins" INT8,
    "last_login" TIMESTAMP(3)
);

-- CreateIndex
CREATE INDEX "job_spec_version_created_by_idx" ON "job_spec_version"("created_by");

-- CreateIndex
CREATE INDEX "job_spec_version_job_spec_idx" ON "job_spec_version"("job_spec");

-- CreateIndex
CREATE UNIQUE INDEX "user_address_key" ON "user"("address");

-- AddForeignKey
ALTER TABLE "job_spec_version" ADD CONSTRAINT "job_spec_version_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("address") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_spec_version" ADD CONSTRAINT "job_spec_version_job_spec_fkey" FOREIGN KEY ("job_spec") REFERENCES "job_spec"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
