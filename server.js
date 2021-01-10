const mongoose = require("mongoose");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(require("./routes"));

/// class added ///
// mongoose.connect() tells Mongoose which database we want to connect to
// If the environment variable MONGODB_URI exists, like on Heroku when we deploy later, it will use that
// Otherwise, it will short-circuit to the local MongoDB server's database at mongodb://localhost/pizza-hunt
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/pizza-hunt", {
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Use this to log mongo queries being executed!
mongoose.set("debug", true);
/// class added ///

app.listen(PORT, () => console.log(`🌍 Connected on localhost:${PORT}`));
