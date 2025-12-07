const express = require("express");
const corsMiddleware = require("./config/cors.js");
const authRouter = require("./routes/authRoute.js");
const profileRouter = require("./routes/profileRoute.js");
const roomRouter = require("./routes/roomRoute.js");
const attendanceRouter = require("./routes/attendanceRoute.js");
const messRouter = require("./routes/messRoute.js");
const messSuggestionRouter = require("./routes/messSuggestionRoute.js");
const issueRouter = require("./routes/issueRoute.js");
const announcementRouter = require("./routes/announcementRoute.js");
require("dotenv").config();

const app = express();
const PORT = process.env.SERVER_PORT;

app.use(corsMiddleware);
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/mess", messRouter);
app.use("/api/mess-suggestions", messSuggestionRouter);
app.use("/api/issues", issueRouter);
app.use("/api/announcements", announcementRouter);

app.get("/", (req, res) => {
  res.status(200).send("<h1>Backend Running Successfully 🚀</h1>");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Local Backend URL: ${process.env.BACKEND_LOCAL_URL}`);
  console.log(`✅ Deployed Backend URL: ${process.env.BACKEND_SERVER_URL}`);
});
