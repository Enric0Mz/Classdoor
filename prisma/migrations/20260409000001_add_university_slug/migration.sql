-- AlterTable
ALTER TABLE "University" ADD COLUMN "slug" TEXT;

-- Generate slugs from university names:
-- Strip accents via TRANSLATE, lowercase, replace non-alphanumeric with hyphens
UPDATE "University"
SET "slug" = TRIM(BOTH '-' FROM
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      LOWER(
        TRANSLATE(
          "name",
          'ÁÀÃÂÉÈÊÍÌÎÓÒÕÔÚÙÛÇáàãâéèêíìîóòõôúùûç',
          'AAAAEEEIIIOOOOUUUCaaaaeeeiiioooouuuc'
        )
      ),
      '[^a-z0-9\s-]', '', 'g'
    ),
    '\s+', '-', 'g'
  )
);

-- Handle duplicate slugs by appending a numeric suffix
DO $$
DECLARE
  duplicate_record RECORD;
  counter INTEGER;
BEGIN
  FOR duplicate_record IN
    SELECT id, slug
    FROM "University"
    WHERE slug IN (
      SELECT slug FROM "University" GROUP BY slug HAVING COUNT(*) > 1
    )
    ORDER BY slug, "createdAt"
  LOOP
    SELECT COUNT(*) INTO counter
    FROM "University"
    WHERE slug = duplicate_record.slug AND id < duplicate_record.id;

    IF counter > 0 THEN
      UPDATE "University"
      SET slug = duplicate_record.slug || '-' || counter
      WHERE id = duplicate_record.id;
    END IF;
  END LOOP;
END $$;

-- Make slug required and unique
ALTER TABLE "University" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "University_slug_key" ON "University"("slug");
