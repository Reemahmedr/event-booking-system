import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import router from "./routes/authRoute.js";
import httpStatusText from "./utils/httpStatusText.js";
import eventRouter from "./routes/eventsRoute.js";
import bookingRouter from "./routes/bookingRoute.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", router);
app.use("/api/events", eventRouter);
app.use("/api/booking", bookingRouter);

app.use((err, req, res, next) => {
  res.status(500).json({
    status: httpStatusText.ERROR,
    message: err.message,
  });
});

mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("mongo is connected");
});

app.listen(process.env.PORT, () => {
  console.log(`server is running on port 5000`);
});
