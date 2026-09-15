import { Router, type IRouter } from "express";
import { eq, sql, count } from "drizzle-orm";
import { db } from "../../../../lib/db/src";
import { productsTable, categoriesTable } from "../../../../lib/db/src/schema";

const router: IRouter = Router();

router.get("/stats/dashboard", async (_req, res): Promise<void> => {
  const [stats] = await db
    .select({
      totalProducts: count(productsTable.id),
    })
    .from(productsTable);

  const [catStats] = await db
    .select({ totalCategories: count(categoriesTable.id) })
    .from(categoriesTable);

  const [inStock] = await db
    .select({ inStockProducts: count(productsTable.id) })
    .from(productsTable)
    .where(eq(productsTable.inStock, true));

  const [outOfStock] = await db
    .select({ outOfStockProducts: count(productsTable.id) })
    .from(productsTable)
    .where(eq(productsTable.inStock, false));

  const [featured] = await db
    .select({ featuredProducts: count(productsTable.id) })
    .from(productsTable)
    .where(eq(productsTable.featured, true));

  res.json({
    totalProducts: Number(stats?.totalProducts ?? 0),
    totalCategories: Number(catStats?.totalCategories ?? 0),
    inStockProducts: Number(inStock?.inStockProducts ?? 0),
    outOfStockProducts: Number(outOfStock?.outOfStockProducts ?? 0),
    featuredProducts: Number(featured?.featuredProducts ?? 0),
  });
});

router.get("/stats/category-counts", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      categoryId: categoriesTable.id,
      categoryName: categoriesTable.name,
      count: sql<number>`cast(count(${productsTable.id}) as int)`,
    })
    .from(categoriesTable)
    .leftJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id, categoriesTable.name)
    .orderBy(categoriesTable.name);

  res.json(rows);
});

export default router;
