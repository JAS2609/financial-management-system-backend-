import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static("public"));

// Routes
import healthcheckRouter from "./routes/healthcheck.route.js";
import userRouter from "./routes/user.route.js";
import recordsRouter from "./routes/records.route.js";
import accountsRouter from "./routes/accounts.route.js";
import dashboardRouter from "./routes/dashboard.route.js";

app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/accounts", accountsRouter);
app.use("/api/v1/records", recordsRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);

export { app };