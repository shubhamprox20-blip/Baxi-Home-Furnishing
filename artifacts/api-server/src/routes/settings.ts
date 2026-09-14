import { Router } from "express";

const router = Router();

// Store URL in memory (or connect to your database table)
let heroBgUrl = "";

// Get current hero background URL
router.get("/hero-bg", (_req, res) => {
  res.json({ bgUrl: heroBgUrl });
});

// Update hero background URL
router.post("/hero-bg", (req, res) => {
  const { bgUrl } = req.body;
  heroBgUrl = bgUrl;
  res.json({ success: true, bgUrl });
});

export default router;