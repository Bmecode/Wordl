const letters = document.querySelectorAll(".scoreboard-letter");
const loadingDiv = document.querySelector(".info-bar");
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

async function init() {
  let currentGuess = "";
  let currentRow = 0;
  let isLoading = true;

  const res = await fetch("https://words.dev-apis.com/word-of-the-day");
  const resObj = await res.json();
  const word = resObj.word.toUpperCase();
  const wordParts = word.split("");
  setLoading(false);
  let done = false;
  isLoading = false;

  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      //add letter to the end
      currentGuess += letter;
    } else {
      //replace the last letter
      currentGuess =
        currentGuess.substring(0, currentGuess.length - 1) + letter;
    }
    letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText =
      letter;
  }

  async function commit() {
    if (currentGuess.length !== ANSWER_LENGTH) {
      //do nothing
      return;
    }
    //TODO validate word
    isLoading = true;
    setLoading(true);
    const res = await fetch("https://words.dev-apis.com/validate-word", {
      method: "POST",
      body: JSON.stringify({ word: currentGuess }),
    });
    const resObj = await res.json();
    const validWord = resObj.validWord;
    //const {validWord} =resObj;

    isLoading = false;
    setLoading(false);

    if (!validWord) {
      markInvalidWord();
      return;
    }

    const guestParts = currentGuess.split("");
    const map = makeMap(wordParts);
    console.log(map);

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guestParts[i] === wordParts[i]) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
        map[guestParts[i]]--;
      }
    }

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guestParts[i] === wordParts[i]) {
        //do nothing we already did it
      } else if (wordParts.includes(guestParts[i]) && map[guestParts[i]] > 0) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
        map[guestParts[i]]--;
      } else {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
      }
    }

    currentRow++;
    if (currentGuess === word) {
      alert("you win!");
      document.querySelector(".brand").classList.add("winner");
      done = true;
    } else if (currentRow === ROUNDS) {
      alert(`You lose, the word was ${word}`);
    }
    currentGuess = "";
  }

  function markInvalidWord() {
    // alert("Not a valid word");
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid");

      setTimeout(function () {
        letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");
      }, 1000);
    }
  }
  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = "";
  }
  document.addEventListener("keydown", function handleKeyPress(event) {
    if (done || isLoading) {
      //do nothing
      return;
    } else {
    }

    const action = event.key;
    if (action === "Enter") {
      commit();
    } else if (action === "Backspace") {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    } else {
      //do nothing
    }
  });
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
  loadingDiv.classList.toggle("hidden", !isLoading);
}

function makeMap(array) {
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    const letter = array[i];
    if (obj[letter]) {
      obj[letter]++;
    } else {
      obj[letter] = 1;
    }
  }
  return obj;
}
init();
