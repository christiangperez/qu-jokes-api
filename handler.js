const fs = require("fs");
const jokes = require("./jokes/index.json");

const randomJoke = () => {
  return jokes[Math.floor(Math.random() * jokes.length)];
};

/**
 * Get N random jokes from a jokeArray
 */
const randomN = (jokeArray, n) => {
  const limit = jokeArray.length < n ? jokeArray.length : n;
  const randomIndicesSet = new Set();

  while (randomIndicesSet.size < limit) {
    const randomIndex = Math.floor(Math.random() * jokeArray.length);
    if (!randomIndicesSet.has(randomIndex)) {
      randomIndicesSet.add(randomIndex);
    }
  }

  return Array.from(randomIndicesSet).map((randomIndex) => {
    return jokeArray[randomIndex];
  });
};

const randomTen = () => randomN(jokes, 10);

const randomSelect = (number) => randomN(jokes, number);

const jokeByType = (type, n) => {
  return randomN(
    jokes.filter((joke) => joke.type === type),
    n
  );
};

const deleteJoke = (id) => {
  const jokeIndex = jokes.findIndex((joke) => joke.id === parseInt(id, 10));

  if (jokeIndex === undefined || jokeIndex === null) {
    return -1;
  }

  jokes.splice(jokeIndex, 1);

  fs.writeFile("./jokes/index.json", JSON.stringify(jokes, null, 2), (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return -1;
    }
  });
  return 1;
};

const addJoke = (newJoke) => {
  jokes.push(newJoke);

  fs.writeFile("./jokes/index.json", JSON.stringify(jokes, null, 2), (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return -1;
    }
    return 1;
  });
};

const likeJoke = (jokeIndex) => {
  if (!jokes[jokeIndex].hasOwnProperty("likes")) {
    jokes[jokeIndex].likes = 0;
  }

  jokes[jokeIndex].likes += 1;

  fs.writeFile("./jokes/index.json", JSON.stringify(jokes, null, 2), (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return -1;
    }
    return 1;
  });
};

const getNextId = () => {
  if (jokes.length === 0) {
    return 1;
  }
  const maxId = jokes.reduce((max, joke) => {
    return joke.id > max ? joke.id : max;
  }, jokes[0].id);
  return maxId + 1;
};

const getTopLikedJokes = () => {
  const topLikedJokes = jokes
    .filter((joke) => joke.likes && joke.likes > 0)
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 10);

  if (topLikedJokes.length === 0) {
    return res.status(404).json({ message: "No jokes with likes found" });
  }

  return topLikedJokes;
};

/**
 * @param {Number} id - joke id
 * @returns a single joke object or undefined
 */
const jokeById = (id) => {
  const jokeToReturn = jokes.find((joke) => joke.id === Number(id));
  return jokeToReturn;
};

module.exports = {
  jokes,
  randomJoke,
  randomN,
  randomTen,
  randomSelect,
  jokeById,
  jokeByType,
  deleteJoke,
  addJoke,
  getNextId,
  likeJoke,
  getTopLikedJokes,
};
