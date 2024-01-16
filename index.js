const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyparser = require("body-parser");

const emailRouter = require("./routes/email");

const { PORT, CLIENT_URL } = process.env;

app.use(express.json());
app.use(bodyparser.json());
app.use(express.static("public"));
app.use(
  cors({
    origin: CLIENT_URL,
  })
);

app.use(emailRouter);

app.get("/sup", (req, res) => {
  res.send("sup bud");
});

const server = app.listen(PORT, () => {
  console.log("Server started");
});
