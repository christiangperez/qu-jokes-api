const express = require("express");
const LimitingMiddleware = require("limiting-middleware");
const cors = require("cors");
const {
  randomJoke,
  randomTen,
  randomSelect,
  jokeByType,
  jokeById,
  deleteJoke,
  addJoke,
  getNextId,
  likeJoke,
  getTopLikedJokes,
} = require("./handler");
const jokes = require("./jokes/index.json");

const app = express();

app.use(express.json());

app.use(new LimitingMiddleware().limitByIp());

app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", (req, res) => {
  res.send("Try /random_joke, /random_ten, /jokes/random, or /jokes/ten");
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.get("/random_joke", (req, res) => {
  res.json(randomJoke());
});

app.get("/random_ten", (req, res) => {
  res.json(randomTen());
});

app.get("/jokes/random/:num", (req, res) => {
  const num = parseInt(req.params.num, 10);

  try {
    if (isNaN(num) || num < 1) {
      return res.status(400).send("The passed number is not valid.");
    }

    const count = jokes.length;

    if (num > Object.keys(jokes).length) {
      res.send(`The passed path exceeds the number of jokes (${count}).`);
    } else {
      res.json(randomSelect(num));
    }
  } catch (err) {
    res.send("The passed path is not a number.");
  }
});

app.get("/jokes/random", (req, res) => {
  res.json(randomJoke());
});

app.get("/jokes/ten", (req, res) => {
  res.json(randomTen());
});

app.get("/jokes/top-liked", (req, res) => {
  console.log("a");
  res.json(getTopLikedJokes());
});

app.get("/jokes/:type/random", (req, res) => {
  res.json(jokeByType(req.params.type, 1));
});

app.get("/jokes/:type/ten", (req, res) => {
  res.json(jokeByType(req.params.type, 10));
});

app.get("/jokes/:id", (req, res, next) => {
  try {
    const { id } = req.params;
    const joke = jokeById(id);

    if (!joke) return next({ statusCode: 404, message: "joke not found" });
    return res.json(joke);
  } catch (e) {
    return next(e);
  }
});

app.delete("/jokes/:id", (req, res) => {
  const { id } = req.params;
  const ret = deleteJoke(id);

  if (ret === -1) {
    return res.status(404).send({ message: "Joke not found" });
  }

  return res.send({ message: "Joke deleted successfully" });
});

app.post("/jokes", (req, res) => {
  const { type, setup, punchline } = req.body;

  if (!type || !setup || !punchline) {
    return res.status(400).json({
      message: "Missing fields, please provide type, setup, punchline",
    });
  }

  const newId = getNextId();
  const newJoke = { type, setup, punchline, id: newId };

  const ret = addJoke(newJoke);

  if (ret === -1) {
    return res.status(400).json({
      message: "Error adding joke, please try again later",
    });
  }

  jokes.push(newJoke);

  return res.send({ message: "Joke added successfully", id: newId });
});

app.put("/jokes/like/:id", (req, res) => {
  const { id } = req.params;
  const jokeIndex = jokes.findIndex((joke) => joke.id === parseInt(id, 10));

  if (jokeIndex === -1) {
    return res.status(404).json({ message: "Joke not found" });
  }

  const ret = likeJoke(jokeIndex);
  if (ret === -1) {
    return res.status(400).send({ message: "Error deleting joke" });
  }

  return res.send({ message: "Joke liked successfully" });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    type: "error",
    message: err.message,
  });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
