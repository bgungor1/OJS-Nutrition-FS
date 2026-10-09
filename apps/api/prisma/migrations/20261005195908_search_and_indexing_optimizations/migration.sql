-- Enable pg_trgm extension for full-text search trigram indexing
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateIndex
CREATE INDEX "Product_tags_idx" ON "Product" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Product_shortExplanation_idx" ON "Product" USING GIN ("shortExplanation" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Product_slug_idx" ON "Product" USING GIN ("slug" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Product_description_idx" ON "Product" USING GIN ("description" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Review_productId_createdAt_idx" ON "Review"("productId", "createdAt" DESC);
