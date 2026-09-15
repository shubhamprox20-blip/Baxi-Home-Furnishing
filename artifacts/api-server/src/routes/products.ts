import { Router, type IRouter } from "express";
import { eq, ilike, and, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db/schema";
import {
  CreateProductBody,
  GetProductParams,
  UpdateProductBody,
  UpdateProductParams,
  DeleteProductParams,
  ListProductsQueryParams,
} from "../../../../lib/api-zod/src/generated/api";

const router: IRouter = Router();

function safeIsoDate(dateVal: unknown): string {
  if (!dateVal) return new Date().toISOString();
  if (dateVal instanceof Date) return dateVal.toISOString();
  return new Date(String(dateVal)).toISOString();
}

function formatProduct(p: Record<string, unknown>, categoryName: string) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: typeof p.price === "string" ? parseFloat(p.price) : Number(p.price ?? 0),
    originalPrice: p.originalPrice
      ? typeof p.originalPrice === "string"
        ? parseFloat(p.originalPrice)
        : Number(p.originalPrice)
      : null,
    categoryId: p.categoryId,
    categoryName,
    imageUrl: p.imageUrl ?? null,
    images: (p.images as string[]) ?? [],
    inStock: p.inStock ?? true,
    stockCount: p.stockCount ?? 0,
    featured: p.featured ?? false,
    material: p.material ?? null,
    dimensions: p.dimensions ?? null,
    careInstructions: p.careInstructions ?? null,
    tags: (p.tags as string[]) ?? [],
    createdAt: safeIsoDate(p.createdAt),
  };
}

// ---------------------------------------------------------------------------
// GET /products/featured
// ---------------------------------------------------------------------------
router.get("/products/featured", async (_req, res): Promise<void> => {
  try {
    const rows = await db
      .select({
        product: productsTable,
        categoryName: categoriesTable.name,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.featured, true))
      .limit(8);

    res.json(
      rows.map((r) =>
        formatProduct(
          r.product as Record<string, unknown>,
          r.categoryName ?? "Uncategorized"
        )
      )
    );
  } catch (err) {
    console.error("❌ Error fetching featured products:", err);
    res.status(500).json({ error: "Failed to fetch featured products", details: String(err) });
  }
});

// ---------------------------------------------------------------------------
// GET /products
// ---------------------------------------------------------------------------
router.get("/products", async (req, res): Promise<void> => {
  try {
    const query = ListProductsQueryParams.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: query.error.message });
      return;
    }

    const { categoryId, search, inStock, featured, limit = 20, offset = 0 } = query.data;

    const conditions = [];
    if (categoryId != null) conditions.push(eq(productsTable.categoryId, categoryId));
    if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
    if (inStock != null) conditions.push(eq(productsTable.inStock, inStock));
    if (featured != null) conditions.push(eq(productsTable.featured, featured));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalRows] = await Promise.all([
      db
        .select({
          product: productsTable,
          categoryName: categoriesTable.name,
        })
        .from(productsTable)
        .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(whereClause)
        .limit(Number(limit))
        .offset(Number(offset))
        .orderBy(productsTable.createdAt),
      db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(productsTable)
        .where(whereClause),
    ]);

    res.json({
      products: rows.map((r) =>
        formatProduct(
          r.product as Record<string, unknown>,
          r.categoryName ?? "Uncategorized"
        )
      ),
      total: Number(totalRows[0]?.count ?? 0),
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (err) {
    console.error("❌ Error listing products:", err);
    res.status(500).json({ error: "Failed to list products", details: String(err) });
  }
});

// ---------------------------------------------------------------------------
// POST /products
// ---------------------------------------------------------------------------
router.post("/products", async (req, res): Promise<void> => {
  try {
    // 1. Coerce body types BEFORE passing to Zod validation
    const rawBody = {
      ...req.body,
      price: req.body.price != null ? Number(req.body.price) : undefined,
      originalPrice:
        req.body.originalPrice != null && req.body.originalPrice !== ""
          ? Number(req.body.originalPrice)
          : undefined,
      stockCount: req.body.stockCount != null ? Number(req.body.stockCount) : 0,
      categoryId: req.body.categoryId != null ? Number(req.body.categoryId) : undefined,
    };

    const parsed = CreateProductBody.safeParse(rawBody);
    if (!parsed.success) {
      console.error("❌ Validation Error on POST /products:", parsed.error.format());
      res.status(400).json({
        error: "Validation failed when creating product",
        details: parsed.error.issues,
      });
      return;
    }

    // 2. Verify Category Exists in Neon Database
    const [existingCategory] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, parsed.data.categoryId));

    if (!existingCategory) {
      res.status(400).json({
        error: `Category ID ${parsed.data.categoryId} does not exist in database. Select a valid category.`,
      });
      return;
    }

    // 3. Insert Product
    const [product] = await db.insert(productsTable).values(parsed.data).returning();

    res.status(201).json(formatProduct(product as Record<string, unknown>, existingCategory.name));
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(500).json({
      error: "Failed to create product in database",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// ---------------------------------------------------------------------------
// GET /products/:id
// ---------------------------------------------------------------------------
router.get("/products/:id", async (req, res): Promise<void> => {
  try {
    const params = GetProductParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [row] = await db
      .select({
        product: productsTable,
        categoryName: categoriesTable.name,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, params.data.id));

    if (!row) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(
      formatProduct(
        row.product as Record<string, unknown>,
        row.categoryName ?? "Uncategorized"
      )
    );
  } catch (err) {
    console.error("❌ Error getting product:", err);
    res.status(500).json({ error: "Failed to retrieve product", details: String(err) });
  }
});

// ---------------------------------------------------------------------------
// PATCH /products/:id
// ---------------------------------------------------------------------------
router.patch("/products/:id", async (req, res): Promise<void> => {
  try {
    const params = UpdateProductParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const rawBody = { ...req.body };
    if (rawBody.price != null) rawBody.price = Number(rawBody.price);
    if (rawBody.originalPrice != null) rawBody.originalPrice = Number(rawBody.originalPrice);
    if (rawBody.stockCount != null) rawBody.stockCount = Number(rawBody.stockCount);
    if (rawBody.categoryId != null) rawBody.categoryId = Number(rawBody.categoryId);

    const body = UpdateProductBody.safeParse(rawBody);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    const [product] = await db
      .update(productsTable)
      .set(body.data)
      .where(eq(productsTable.id, params.data.id))
      .returning();

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const [cat] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, product.categoryId));

    res.json(formatProduct(product as Record<string, unknown>, cat?.name ?? "Uncategorized"));
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({ error: "Failed to update product", details: String(err) });
  }
});

// ---------------------------------------------------------------------------
// DELETE /products/:id
// ---------------------------------------------------------------------------
router.delete("/products/:id", async (req, res): Promise<void> => {
  try {
    const params = DeleteProductParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    // Attempt standard deletion
    try {
      const [product] = await db
        .delete(productsTable)
        .where(eq(productsTable.id, params.data.id))
        .returning();

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      res.sendStatus(204);
    } catch (dbErr: any) {
      // If product exists in orders, soft-delete (archive) it instead
      if (dbErr?.code === "23503") { // Postgres Foreign Key Violation
        await db
          .update(productsTable)
          .set({ inStock: false })
          .where(eq(productsTable.id, params.data.id));

        res.status(200).json({
          message: "Product has associated orders so it was deactivated instead of deleted.",
        });
        return;
      }
      throw dbErr;
    }
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product", details: String(err) });
  }
});

export default router;