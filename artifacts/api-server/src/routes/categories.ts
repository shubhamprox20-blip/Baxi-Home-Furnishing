import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { categoriesTable, productsTable } from "@workspace/db/schema";
import {
  CreateCategoryBody,
  GetCategoryParams,
  UpdateCategoryBody,
  UpdateCategoryParams,
  DeleteCategoryParams,
} from "../../../../lib/api-zod/src/generated/api";

const router: IRouter = Router();

// Helper to safely convert Date or String to ISO string
function safeIsoDate(dateVal: unknown): string {
  if (!dateVal) return new Date().toISOString();
  if (dateVal instanceof Date) return dateVal.toISOString();
  return new Date(String(dateVal)).toISOString();
}

router.get("/categories", async (req, res): Promise<void> => {
  try {
    const cats = await db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        slug: categoriesTable.slug,
        description: categoriesTable.description,
        imageUrl: categoriesTable.imageUrl,
        createdAt: categoriesTable.createdAt,
        productCount: sql<number>`cast(count(${productsTable.id}) as int)`,
      })
      .from(categoriesTable)
      .leftJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
      .groupBy(categoriesTable.id)
      .orderBy(categoriesTable.name);

    res.json(
      cats.map((c) => ({
        ...c,
        createdAt: safeIsoDate(c.createdAt),
      }))
    );
  } catch (err) {
    console.error("❌ Error fetching categories:", err);
    res.status(500).json({
      error: "Failed to fetch categories",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

router.post("/categories", async (req, res): Promise<void> => {
  try {
    const parsed = CreateCategoryBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [cat] = await db
      .insert(categoriesTable)
      .values(parsed.data)
      .returning();

    res.status(201).json({
      ...cat,
      productCount: 0,
      createdAt: safeIsoDate(cat.createdAt),
    });
  } catch (err) {
    console.error("❌ Error creating category:", err);
    res.status(500).json({
      error: "Failed to create category",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

router.get("/categories/:id", async (req, res): Promise<void> => {
  try {
    const params = GetCategoryParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [cat] = await db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        slug: categoriesTable.slug,
        description: categoriesTable.description,
        imageUrl: categoriesTable.imageUrl,
        createdAt: categoriesTable.createdAt,
        productCount: sql<number>`cast(count(${productsTable.id}) as int)`,
      })
      .from(categoriesTable)
      .leftJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(categoriesTable.id, params.data.id))
      .groupBy(categoriesTable.id);

    if (!cat) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.json({
      ...cat,
      createdAt: safeIsoDate(cat.createdAt),
    });
  } catch (err) {
    console.error("❌ Error fetching category by ID:", err);
    res.status(500).json({
      error: "Failed to fetch category",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

router.patch("/categories/:id", async (req, res): Promise<void> => {
  try {
    const params = UpdateCategoryParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const body = UpdateCategoryBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    const [cat] = await db
      .update(categoriesTable)
      .set(body.data)
      .where(eq(categoriesTable.id, params.data.id))
      .returning();

    if (!cat) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.json({
      ...cat,
      productCount: 0,
      createdAt: safeIsoDate(cat.createdAt),
    });
  } catch (err) {
    console.error("❌ Error updating category:", err);
    res.status(500).json({
      error: "Failed to update category",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

router.delete("/categories/:id", async (req, res): Promise<void> => {
  try {
    const params = DeleteCategoryParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [cat] = await db
      .delete(categoriesTable)
      .where(eq(categoriesTable.id, params.data.id))
      .returning();

    if (!cat) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    console.error("❌ Error deleting category:", err);
    res.status(500).json({
      error: "Failed to delete category",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

export default router;