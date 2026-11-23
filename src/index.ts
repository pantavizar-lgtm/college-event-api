import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { pool } from "./db";
import eventsRouter from "./routes/event";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// NEW: logger middleware (runs for every request)
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Event API running" });
});

app.get("/health/db", async (req: Request, res: Response) => {
  const result = await pool.query("SELECT NOW() AS time");
  res.json({ connected: true, time: result.rows[0].time });
});

app.use("/events", eventsRouter);

// NEW: 404 handler (no route matched)
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// NEW: error handler (must have 4 parameters)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
