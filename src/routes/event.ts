import { Router, Request, Response } from "express";
import { pool } from "../db";

const router = Router();

// GET /events - list all events
router.get("/", async (req: Request, res: Response) => {
  const { rows } = await pool.query(
    "SELECT * FROM events ORDER BY event_date ASC"
  );
  res.json(rows);
});

// GET /events/:id - one event
router.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "id must be a number" });
    return;
  }
  const { rows } = await pool.query("SELECT * FROM events WHERE id = $1", [id]);
  if (rows.length === 0) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json(rows[0]);
});

// POST /events - create
router.post("/", async (req: Request, res: Response) => {
  const { title, description, venue, event_date, capacity } = req.body;
  if (!title || !venue || !event_date || !capacity) {
    res
      .status(400)
      .json({ error: "title, venue, event_date and capacity are required" });
    return;
  }
  const { rows } = await pool.query(
    `INSERT INTO events (title, description, venue, event_date, capacity)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [title, description ?? null, venue, event_date, capacity]
  );
  res.status(201).json(rows[0]);
});

// PATCH /events/:id - update only the fields sent
router.patch("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "id must be a number" });
    return;
  }
  const { title, description, venue, event_date, capacity } = req.body;
  const { rows } = await pool.query(
    `UPDATE events
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         venue = COALESCE($3, venue),
         event_date = COALESCE($4, event_date),
         capacity = COALESCE($5, capacity)
     WHERE id = $6
     RETURNING *`,
    [title ?? null, description ?? null, venue ?? null, event_date ?? null, capacity ?? null, id]
  );
  if (rows.length === 0) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json(rows[0]);
});

// DELETE /events/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "id must be a number" });
    return;
  }
  const result = await pool.query("DELETE FROM events WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.status(204).send();
});

export default router;
