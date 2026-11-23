import "dotenv/config";
import express, { Request, Response } from "express";
import { pool } from "./db";
import eventsRouter from "./routes/event";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Event API running" });
});

app.get("/health/db", async (req: Request, res: Response) => {
  const result = await pool.query("SELECT NOW() AS time");
  res.json({ connected: true, time: result.rows[0].time });
});

app.use("/events", eventsRouter); // NEW

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
