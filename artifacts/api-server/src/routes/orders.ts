import { Router, type IRouter, type Request } from "express";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  orderItemsTable,
  ordersTable,
  productsTable,
} from "@workspace/db/schema";
import {
  CreateOrderBody,
  GetAdminOrderParams,
  GetOrderParams,
  ListAdminOrdersResponse,
  ListOrdersResponse,
  UpdateAdminOrderBody,
  UpdateAdminOrderParams,
} from "../../../../lib/api-zod/src/generated/api";
import { getRequiredUserId, requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const orderStatuses = new Set([
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
]);

async function formatOrder(orderId: number) {
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId));
  if (!order) return null;

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, orderId));

  return {
    id: order.id,
    userId: order.userId,
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    address: order.address,
    city: order.city,
    total: order.total,
    status: order.status,
    items: items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      imageUrl: item.imageUrl ?? null,
    })),
    createdAt: order.createdAt.toISOString(),
  };
}

async function formatOrders(orderIds: number[]) {
  const orders = await Promise.all(orderIds.map((id) => formatOrder(id)));
  return orders.filter((order): order is NonNullable<typeof order> => !!order);
}

router.get("/orders", requireAuth, async (req, res): Promise<void> => {
  const userId = getRequiredUserId(req);
  const orders = await db
    .select({ id: ordersTable.id })
    .from(ordersTable)
    .where(eq(ordersTable.userId, userId))
    .orderBy(desc(ordersTable.createdAt));
  res.json(ListOrdersResponse.parse(await formatOrders(orders.map((o) => o.id))));
});

router.post("/orders", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = getRequiredUserId(req);
  const productIds = parsed.data.items.map((item) => item.productId);
  const products = await db
    .select()
    .from(productsTable)
    .where(inArray(productsTable.id, productIds));
  const productMap = new Map(products.map((product) => [product.id, product]));

  for (const item of parsed.data.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      res.status(400).json({ error: `Product ${item.productId} was not found` });
      return;
    }
    if (!product.inStock || product.stockCount < item.quantity) {
      res.status(400).json({ error: `${product.name} is not available in that quantity` });
      return;
    }
  }

  const total = parsed.data.items.reduce((sum, item) => {
    const product = productMap.get(item.productId)!;
    return sum + product.price * item.quantity;
  }, 0);

  const created = await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(ordersTable)
      .values({
        userId,
        customerName: parsed.data.customerName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        address: parsed.data.address,
        city: parsed.data.city,
        total,
        status: "pending",
      })
      .returning();

    await tx.insert(orderItemsTable).values(
      parsed.data.items.map((item) => {
        const product = productMap.get(item.productId)!;
        return {
          orderId: order.id,
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: product.price,
          imageUrl: product.imageUrl,
        };
      }),
    );

    for (const item of parsed.data.items) {
      const product = productMap.get(item.productId)!;
      const nextStock = product.stockCount - item.quantity;
      await tx
        .update(productsTable)
        .set({ stockCount: nextStock, inStock: nextStock > 0 })
        .where(eq(productsTable.id, product.id));
    }

    return order;
  });

  const result = await formatOrder(created.id);
  res.status(201).json(result);
});

router.get("/orders/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = getRequiredUserId(req);
  const [ownedOrder] = await db
    .select({ id: ordersTable.id })
    .from(ordersTable)
    .where(and(eq(ordersTable.id, params.data.id), eq(ordersTable.userId, userId)));
  if (!ownedOrder) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(await formatOrder(ownedOrder.id));
});

router.get("/admin/orders", requireAuth, async (_req, res): Promise<void> => {
  const orders = await db
    .select({ id: ordersTable.id })
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt));
  res.json(ListAdminOrdersResponse.parse(await formatOrders(orders.map((o) => o.id))));
});

router.get("/admin/orders/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetAdminOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const result = await formatOrder(params.data.id);
  if (!result) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(result);
});

router.patch("/admin/orders/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateAdminOrderParams.safeParse(req.params);
  const body = UpdateAdminOrderBody.safeParse(req.body);
  if (!params.success || !body.success || !orderStatuses.has(body.data.status)) {
    res.status(400).json({ error: "Invalid order status" });
    return;
  }

  const [updated] = await db
    .update(ordersTable)
    .set({ status: body.data.status })
    .where(eq(ordersTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(await formatOrder(updated.id));
});

export default router;