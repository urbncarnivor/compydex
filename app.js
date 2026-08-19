const scanButton = document.getElementById("scanButton");
scanButton.addEventListener("click", openScanner);

const searchPanel = document.getElementById("searchPanel");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchStatus = document.getElementById("searchStatus");
const searchResults = document.getElementById("searchResults");

const cardDetailPanel = document.getElementById("cardDetailPanel");
const closeDetailButton = document.getElementById("closeDetailButton");

const selectedCardImage = document.getElementById("selectedCardImage");
const selectedCardName = document.getElementById("selectedCardName");
const selectedCardSet = document.getElementById("selectedCardSet");
const selectedCardNumber = document.getElementById("selectedCardNumber");
const selectedCardRarity = document.getElementById("selectedCardRarity");
const priceVariantField = document.getElementById("priceVariantField");
const priceVariantSelect = document.getElementById("priceVariantSelect");

const conditionSelect = document.getElementById("conditionSelect");
const cardTypeSelect = document.getElementById("cardTypeSelect");
const gradeSelect = document.getElementById("gradeSelect");
const gradeField = document.getElementById("gradeField");
const conditionField = conditionSelect.closest(".detail-field");
const marketPrice = document.getElementById("marketPrice");
const conditionPrice = document.getElementById("conditionPrice");
const marketPriceLabel = document.getElementById("marketPriceLabel");
const conditionPriceLabel = document.getElementById("conditionPriceLabel");
const finalCompInput = document.getElementById("finalCompInput");
const percentageInput = document.getElementById("percentageInput");
const offerAmount = document.getElementById("offerAmount");
const recentCardsContainer = document.getElementById("recentCards");
const ebaySoldButton = document.getElementById("ebaySoldButton");
const tradeModeButton = document.getElementById("tradeModeButton");
const tradePanel = document.getElementById("tradePanel");
const closeTradeButton = document.getElementById("closeTradeButton");
const addYourCardButton =
  document.getElementById("addYourCardButton");

const addTheirCardButton =
  document.getElementById("addTheirCardButton");
const yourTradeCards =
  document.getElementById("yourTradeCards");

const theirTradeCards =
  document.getElementById("theirTradeCards");

const yourTradeTotal =
  document.getElementById("yourTradeTotal");

const theirTradeTotal =
  document.getElementById("theirTradeTotal");

const tradeDifference =
  document.getElementById("tradeDifference");

const tradeStatus =
  document.getElementById("tradeStatus");
const calculatorDisplay =
  document.getElementById("calculatorDisplay");
const calculatorHistory =
  document.getElementById("calculatorHistory");
const calculatorClearButton =
  document.getElementById("calculatorClearButton");
const calculatorPanel =
  document.getElementById("calculatorPanel");
const calculatorToggleButton =
  document.getElementById("calculatorToggleButton");

let selectedCardMarketPrice = 0;
let selectedCardData = null;
let activeTradeSide = null;
let currentSearchCards = [];
let yourTradeCardData = [];
let theirTradeCardData = [];
let yourCashAdjustment = 0;
let theirCashAdjustment = 0;

let calculatorValue = "0";
let calculatorFirstOperand = null;
let calculatorOperator = null;
let calculatorWaitingForOperand = false;

const CALCULATOR_OPERATOR_LABELS = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷"
};

function normalizeCalculatorNumber(value) {
  if (!Number.isFinite(value)) {
    return null;
  }

  return Number(value.toPrecision(12));
}

function updateCalculatorDisplay() {
  calculatorDisplay.textContent = calculatorValue;
}

function clearCalculator() {
  calculatorValue = "0";
  calculatorFirstOperand = null;
  calculatorOperator = null;
  calculatorWaitingForOperand = false;
  calculatorHistory.innerHTML = "&nbsp;";
  updateCalculatorDisplay();
}

function inputCalculatorDigit(digit) {
  if (calculatorValue === "Error" || calculatorWaitingForOperand) {
    calculatorValue = digit;
    calculatorWaitingForOperand = false;
  } else if (calculatorValue === "0") {
    calculatorValue = digit;
  } else if (calculatorValue.length < 14) {
    calculatorValue += digit;
  }

  updateCalculatorDisplay();
}

function inputCalculatorDecimal() {
  if (calculatorValue === "Error" || calculatorWaitingForOperand) {
    calculatorValue = "0.";
    calculatorWaitingForOperand = false;
  } else if (!calculatorValue.includes(".")) {
    calculatorValue += ".";
  }

  updateCalculatorDisplay();
}

function calculateCalculatorResult(firstValue, secondValue, operator) {
  if (operator === "+") {
    return firstValue + secondValue;
  }

  if (operator === "-") {
    return firstValue - secondValue;
  }

  if (operator === "*") {
    return firstValue * secondValue;
  }

  if (operator === "/") {
    return secondValue === 0 ? null : firstValue / secondValue;
  }

  return secondValue;
}

function setCalculatorError() {
  calculatorValue = "Error";
  calculatorFirstOperand = null;
  calculatorOperator = null;
  calculatorWaitingForOperand = true;
  calculatorHistory.textContent = "Cannot divide by zero";
  updateCalculatorDisplay();
}

function chooseCalculatorOperator(nextOperator) {
  const inputValue = Number(calculatorValue);

  if (!Number.isFinite(inputValue)) {
    clearCalculator();
    return;
  }

  if (calculatorOperator && calculatorWaitingForOperand) {
    calculatorOperator = nextOperator;
    calculatorHistory.textContent =
      `${calculatorValue} ${CALCULATOR_OPERATOR_LABELS[nextOperator]}`;
    return;
  }

  if (calculatorFirstOperand === null) {
    calculatorFirstOperand = inputValue;
  } else if (calculatorOperator) {
    const result = calculateCalculatorResult(
      calculatorFirstOperand,
      inputValue,
      calculatorOperator
    );

    if (result === null) {
      setCalculatorError();
      return;
    }

    const normalizedResult = normalizeCalculatorNumber(result);
    calculatorValue = String(normalizedResult);
    calculatorFirstOperand = normalizedResult;
    updateCalculatorDisplay();
  }

  calculatorOperator = nextOperator;
  calculatorWaitingForOperand = true;
  calculatorHistory.textContent =
    `${calculatorValue} ${CALCULATOR_OPERATOR_LABELS[nextOperator]}`;
}

function finishCalculatorEquation() {
  if (calculatorOperator === null || calculatorFirstOperand === null) {
    return;
  }

  const secondOperand = Number(calculatorValue);
  const firstOperand = calculatorFirstOperand;
  const operator = calculatorOperator;
  const result = calculateCalculatorResult(
    firstOperand,
    secondOperand,
    operator
  );

  if (result === null) {
    setCalculatorError();
    return;
  }

  const normalizedResult = normalizeCalculatorNumber(result);

  calculatorHistory.textContent =
    `${firstOperand} ${CALCULATOR_OPERATOR_LABELS[operator]} ${secondOperand} =`;
  calculatorValue = String(normalizedResult);
  calculatorFirstOperand = null;
  calculatorOperator = null;
  calculatorWaitingForOperand = true;
  updateCalculatorDisplay();
}

function applyCalculatorPercent() {
  const inputValue = Number(calculatorValue);

  if (!Number.isFinite(inputValue)) {
    clearCalculator();
    return;
  }

  let percentValue = inputValue / 100;

  if (
    calculatorFirstOperand !== null &&
    (calculatorOperator === "+" || calculatorOperator === "-")
  ) {
    percentValue = calculatorFirstOperand * percentValue;
  }

  calculatorValue = String(normalizeCalculatorNumber(percentValue));
  calculatorWaitingForOperand = false;
  updateCalculatorDisplay();
}

function toggleCalculatorSign() {
  const inputValue = Number(calculatorValue);

  if (!Number.isFinite(inputValue) || inputValue === 0) {
    return;
  }

  calculatorValue = String(normalizeCalculatorNumber(inputValue * -1));
  updateCalculatorDisplay();
}

function backspaceCalculator() {
  if (calculatorWaitingForOperand || calculatorValue === "Error") {
    return;
  }

  calculatorValue =
    calculatorValue.length > 1
      ? calculatorValue.slice(0, -1)
      : "0";

  if (calculatorValue === "-") {
    calculatorValue = "0";
  }

  updateCalculatorDisplay();
}

function handleCalculatorAction(action) {
  if (action === "decimal") {
    inputCalculatorDecimal();
  } else if (action === "equals") {
    finishCalculatorEquation();
  } else if (action === "percent") {
    applyCalculatorPercent();
  } else if (action === "toggle-sign") {
    toggleCalculatorSign();
  } else if (action === "backspace") {
    backspaceCalculator();
  }
}

document
  .querySelectorAll("[data-calculator-digit]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      inputCalculatorDigit(button.dataset.calculatorDigit);
    });
  });

document
  .querySelectorAll("[data-calculator-operator]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      chooseCalculatorOperator(button.dataset.calculatorOperator);
    });
  });

document
  .querySelectorAll("[data-calculator-action]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      handleCalculatorAction(button.dataset.calculatorAction);
    });
  });

calculatorClearButton.addEventListener("click", clearCalculator);

function setCalculatorCollapsed(isCollapsed) {
  calculatorPanel.classList.toggle("is-collapsed", isCollapsed);
  calculatorToggleButton.setAttribute(
    "aria-expanded",
    String(!isCollapsed)
  );
  calculatorToggleButton.querySelector(
    ".calculator-toggle-icon"
  ).textContent = isCollapsed ? "+" : "−";
  calculatorToggleButton.setAttribute(
    "aria-label",
    isCollapsed ? "Expand calculator" : "Minimize calculator"
  );
}

calculatorToggleButton.addEventListener("click", () => {
  setCalculatorCollapsed(
    !calculatorPanel.classList.contains("is-collapsed")
  );
});

document.addEventListener("keydown", (event) => {
  const activeElement = document.activeElement;
  const isEditingField =
    activeElement?.matches("input, select, textarea");

  if (isEditingField) {
    return;
  }

  if (/^\d$/.test(event.key)) {
    inputCalculatorDigit(event.key);
  } else if (["+", "-", "*", "/"].includes(event.key)) {
    chooseCalculatorOperator(event.key);
  } else if (event.key === ".") {
    inputCalculatorDecimal();
  } else if (event.key === "%") {
    applyCalculatorPercent();
  } else if (event.key === "Enter" || event.key === "=") {
    finishCalculatorEquation();
  } else if (event.key === "Backspace") {
    backspaceCalculator();
  } else if (event.key === "Escape") {
    clearCalculator();
  } else {
    return;
  }

  event.preventDefault();
});

tradeModeButton.addEventListener("click", () => {
  tradePanel.classList.remove("hidden");

  tradePanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});
addYourCardButton.addEventListener("click", () => {
  activeTradeSide = "your";

  searchInput.value = "";
  searchStatus.textContent =
    "Search for a card to add to Your Side";

  if (currentSearchCards.length > 0) {
    displayCards(currentSearchCards);
  }

  searchInput.focus();

  searchPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

addTheirCardButton.addEventListener("click", () => {
  activeTradeSide = "their";

  searchInput.value = "";
  searchStatus.textContent =
    "Search for a card to add to Their Side";

  if (currentSearchCards.length > 0) {
    displayCards(currentSearchCards);
  }

  searchInput.focus();

  searchPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});
closeTradeButton.addEventListener("click", () => {
  activeTradeSide = null;
  tradePanel.classList.add("hidden");

  if (currentSearchCards.length > 0) {
    displayCards(currentSearchCards);
  }
});

function updateCardTypeFields() {
  const isRaw = cardTypeSelect.value === "raw";

  conditionField.style.display = isRaw ? "" : "none";
  gradeField.style.display = isRaw ? "none" : "";

  if (isRaw) {
    marketPriceLabel.textContent = "TCG Market";
    conditionPriceLabel.textContent = "Condition Value";

    marketPrice.textContent =
      selectedCardMarketPrice > 0
        ? formatMoney(selectedCardMarketPrice)
        : "Unavailable";

    updateConditionValue();
  } else {
    marketPriceLabel.textContent = "Graded Comp";
    conditionPriceLabel.textContent = "Calculated Offer";

    marketPrice.textContent = "Use eBay sold comps";
    conditionPrice.textContent = "Enter graded comp";
    finalCompInput.value = "";
    offerAmount.textContent = formatMoney(0);
  }
}
cardTypeSelect.addEventListener("change", updateCardTypeFields);

gradeSelect.addEventListener("change", () => {
  updateCardTypeFields();
});

updateCardTypeFields();
closeDetailButton.addEventListener("click", () => {
  cardDetailPanel.classList.add("hidden");
});

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = searchInput.value.trim();

  if (!query) {
    return;
  }

  searchStatus.textContent = "Searching...";
  searchResults.innerHTML = "";

  try {
    const cards = await searchCards(query);

    if (cards.length === 0) {
      searchStatus.textContent = "No matching cards found.";
      return;
    }

    searchStatus.textContent =
      `${cards.length} card${cards.length === 1 ? "" : "s"} found`;

    displayCards(cards);

  } catch (error) {
    console.error(error);

    searchStatus.textContent =
      `Search failed: ${error.message}`;
  }
});

conditionSelect.addEventListener("change", () => {
  updateConditionValue();
});

finalCompInput.addEventListener("input", () => {
  updateOfferAmount();
});

percentageInput.addEventListener("input", () => {
  updateOfferAmount();
});

document.querySelectorAll("[data-percentage]").forEach((button) => {
  button.addEventListener("click", () => {
    percentageInput.value = button.dataset.percentage;
    updateOfferAmount();
  });
});

async function searchCards(query) {
  const words = query
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const numberWord = words.find((word) =>
    /^\d{1,4}(?:\/\d{1,4})?$/.test(word)
  );

  const nameWords = words.filter(
    (word) => word !== numberWord
  );

  if (nameWords.length === 0 || !numberWord) {
  throw new Error(
    "Enter the card name and number, for example: Charizard V 154"
  );
}

  const searchedName = nameWords.join(" ").toLowerCase();

const apiQuery =
  nameWords.length === 1
    ? `name:${searchedName}*`
    : `name:"${searchedName}"`;

  const url =
  `/api/cards?q=${encodeURIComponent(apiQuery)}`;

  let response;
let lastFetchError;

for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    response = await fetch(url);

    if (response.ok || response.status < 500) {
      break;
    }
  } catch (error) {
    lastFetchError = error;
  }

  if (attempt < 3) {
    await new Promise((resolve) =>
      setTimeout(resolve, attempt * 750)
    );
  }
}

if (!response) {
  throw new Error(
    lastFetchError?.message || "Pokémon API temporarily unavailable"
  );
}

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `API error ${response.status}: ${errorText}`
    );
  }

  const result = await response.json();
  let cards = result.data || [];

  cards.sort((a, b) => {
    const aExact =
      a.name.toLowerCase() === searchedName;

    const bExact =
      b.name.toLowerCase() === searchedName;

    if (aExact !== bExact) {
      return Number(bExact) - Number(aExact);
    }

    const aDate = a.set?.releaseDate || "";
    const bDate = b.set?.releaseDate || "";

    return bDate.localeCompare(aDate);
  });

  if (numberWord) {
    const exactNumber = String(
      Number(numberWord.split("/")[0])
    );

    cards = cards.filter((card) => {
      const normalizedCardNumber = String(
        Number(card.number)
      );

      return normalizedCardNumber === exactNumber;
    });
  }

  return cards;
}

async function searchCardsByName(name) {
  const cleanName =
    name.trim().toLowerCase();

  const nameWords = cleanName
    .split(/\s+/)
    .filter(Boolean);

  const apiQuery =
    nameWords.length === 1
      ? `name:${cleanName}*`
      : `name:"${cleanName}"`;

  const url =
    `/api/cards?q=${encodeURIComponent(apiQuery)}`;

  let response = null;
  let requestError = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      response = await fetch(url);

      if (
        response.ok ||
        (response.status !== 429 && response.status < 500)
      ) {
        break;
      }
    } catch (error) {
      requestError = error;
    }

    if (attempt < 2) {
      await new Promise((resolve) =>
        setTimeout(resolve, 650)
      );
    }
  }

  if (!response?.ok) {
    if (response?.status === 400) {
      return [];
    }

    throw new Error(
      requestError?.message ||
      "The card database is temporarily unavailable."
    );
  }

  const result =
    await response.json();

  const cards =
    (result.data || []).filter(
      (card) =>
        card.name?.trim().toLowerCase() === cleanName
    );

  cards.sort((a, b) => {
    const aDate =
      a.set?.releaseDate || "";

    const bDate =
      b.set?.releaseDate || "";

    return bDate.localeCompare(aDate);
  });

  return cards;
}

function getScannedCollectorNumber(text) {
  const fractionMatch =
    text.match(/\d{1,4}\s*\/\s*\d{1,4}/);

  const standaloneMatch =
    text.trim().match(/^\d{1,3}$/);

  const match = fractionMatch || standaloneMatch;

  return match
    ? match[0].replace(/\s+/g, "")
    : "";
}

function getEditDistance(first, second) {
  const rows = second.length + 1;
  const columns = first.length + 1;
  const matrix = Array.from(
    { length: rows },
    () => Array(columns).fill(0)
  );

  for (let column = 0; column < columns; column++) {
    matrix[0][column] = column;
  }

  for (let row = 0; row < rows; row++) {
    matrix[row][0] = row;
  }

  for (let row = 1; row < rows; row++) {
    for (let column = 1; column < columns; column++) {
      const substitutionCost =
        first[column - 1] === second[row - 1] ? 0 : 1;

      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + substitutionCost
      );
    }
  }

  return matrix[rows - 1][columns - 1];
}

function normalizeComparableCardName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

async function searchCardsByCollectorNumber(collectorNumber) {
  const numberPart = String(
    collectorNumber.split("/")[0]
  ).replace(/\D/g, "");

  if (!numberPart) {
    return [];
  }

  const url =
    `/api/cards?q=${encodeURIComponent(`number:${numberPart}`)}`;
  let response = null;
  let requestError = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      response = await fetch(url);

      if (
        response.ok ||
        (response.status !== 429 && response.status < 500)
      ) {
        break;
      }
    } catch (error) {
      requestError = error;
    }

    if (attempt < 2) {
      await new Promise((resolve) =>
        setTimeout(resolve, 650)
      );
    }
  }

  if (!response?.ok) {
    throw new Error(
      requestError?.message ||
      "The card database is temporarily unavailable."
    );
  }

  const result = await response.json();
  const scannedNumber = String(Number(numberPart));
  const totalPart = collectorNumber.includes("/")
    ? String(Number(collectorNumber.split("/")[1]))
    : "";

  return (result.data || []).filter((card) => {
    if (String(Number(card.number)) !== scannedNumber) {
      return false;
    }

    if (!totalPart) {
      return true;
    }

    const printedTotal = String(
      Number(card.set?.printedTotal)
    );
    const setTotal = String(Number(card.set?.total));

    return printedTotal === totalPart || setTotal === totalPart;
  });
}

async function recoverCardFromNameAndNumber(
  scannedNames,
  collectorNumber
) {
  const numberedCards =
    await searchCardsByCollectorNumber(collectorNumber);
  const comparableNames = scannedNames
    .flatMap((name) => getScannedNameCandidates(name))
    .map(normalizeComparableCardName)
    .filter(Boolean);

  if (numberedCards.length === 0 || comparableNames.length === 0) {
    return null;
  }

  const scoredCards = numberedCards
    .map((card) => {
      const officialName = normalizeComparableCardName(card.name);
      const distance = Math.min(
        ...comparableNames.map((candidate) =>
          getEditDistance(candidate, officialName)
        )
      );
      const allowedDistance =
        officialName.length >= 11
          ? 3
          : officialName.length >= 6
            ? 2
            : 1;

      return {
        card,
        distance,
        allowedDistance,
      };
    })
    .sort((a, b) => a.distance - b.distance);

  const bestMatch = scoredCards[0];
  const secondMatch = scoredCards[1];

  if (
    !bestMatch ||
    bestMatch.distance > bestMatch.allowedDistance ||
    bestMatch.distance === secondMatch?.distance
  ) {
    return null;
  }

  return bestMatch.card;
}

function findCardByFuzzyCollectorNumber(cards, numberText) {
  const scannedDigits = numberText.replace(/\D/g, "");

  if (scannedDigits.length < 3) {
    return null;
  }

  const scoredCards = cards
    .map((card) => {
      const cardNumber = String(card.number || "").replace(/\D/g, "");
      const setTotal = String(
        card.set?.printedTotal || card.set?.total || ""
      ).replace(/\D/g, "");

      if (!cardNumber || !setTotal) {
        return null;
      }

      const signature = `${cardNumber}${setTotal}`;
      const possibleLengths = [
        signature.length - 1,
        signature.length,
        signature.length + 1,
      ].filter((length) => length > 0);

      let bestDistance = getEditDistance(
        scannedDigits,
        signature
      );

      for (const length of possibleLengths) {
        for (
          let start = 0;
          start + length <= scannedDigits.length;
          start++
        ) {
          const portion = scannedDigits.slice(
            start,
            start + length
          );
          bestDistance = Math.min(
            bestDistance,
            getEditDistance(portion, signature)
          );
        }
      }

      return { card, distance: bestDistance };
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance);

  if (
    scoredCards.length === 0 ||
    scoredCards[0].distance > 1 ||
    scoredCards[0].distance === scoredCards[1]?.distance
  ) {
    return null;
  }

  return scoredCards[0].card;
}

function getScannedCardNames(text) {
  const headerWords =
    /\b(evolves?|from|put|basic|pokemon|pokémon|stage|trainer|energy|illustrator|length|weight)\b/i;

  const lines = text
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/\b\d{2,3}\s*HP\b/gi, "")
        .replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ'’\-.\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter((line) => {
      const letterCount =
        (line.match(/[a-zA-ZÀ-ÖØ-öø-ÿ]/g) || []).length;

      return letterCount >= 3;
    });

  if (lines.length === 0) {
    return [];
  }

  const rankedLines = lines
    .map((line, index) => {
      const wordCount = line.split(/\s+/).length;
      let score = 100 - line.length;

      if (wordCount <= 3) {
        score += 35;
      }

      if (headerWords.test(line)) {
        score -= 120;
      }

      // When scores are otherwise close, prefer the lower OCR line because
      // vintage cards place evolution instructions above the card name.
      score += index * 3;

      return { line, score };
    })
    .sort((a, b) => b.score - a.score);

  return rankedLines.map(({ line }) => line);
}

function getScannedNameCandidates(name) {
  const normalizedName = name
    .replace(/^[^a-zA-ZÀ-ÖØ-öø-ÿ]+/, "")
    .replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ'’\-.]+$/, "")
    .replace(/\s+/g, " ")
    .trim();

  const words = normalizedName
    .split(" ")
    .filter(Boolean)
    .slice(0, 8);

  const candidates = [];

  // Try the complete OCR result first, then progressively shorter
  // contiguous phrases. The API confirms which phrase is a real card name.
  for (let length = words.length; length >= 1; length--) {
    for (let start = 0; start + length <= words.length; start++) {
      const candidate = words
        .slice(start, start + length)
        .join(" ");

      const letterCount =
        (candidate.match(/[a-zA-ZÀ-ÖØ-öø-ÿ]/g) || []).length;
      const hasReadableWord = candidate
        .split(/\s+/)
        .some((word) =>
          (word.match(/[a-zA-ZÀ-ÖØ-öø-ÿ]/g) || []).length >= 3
        );

      if (
        letterCount >= 3 &&
        hasReadableWord &&
        !candidates.includes(candidate)
      ) {
        candidates.push(candidate);
      }
    }
  }

  return candidates.slice(0, 12);
}

async function findScannedCardsByName(names) {
  const candidates = [
    ...new Set(
      names.flatMap((name) =>
        getScannedNameCandidates(name)
      )
    ),
  ].slice(0, 24);

  if (candidates.length === 0) {
    const error = new Error(
      "Could not read the card name. Let the camera focus, then retake the photo."
    );
    error.isScanReadError = true;
    throw error;
  }

  for (const candidate of candidates) {
    try {
      const cards = await searchCardsByName(candidate);

      if (cards.length > 0) {
        return {
          cards,
          matchedName: candidate,
        };
      }
    } catch (error) {
      // A server/network failure will affect every candidate. Stop here
      // instead of making the user wait through the entire fallback list.
      throw error;
    }
  }

  return {
    cards: [],
    matchedName: candidates[0] || "",
  };
}

async function searchScannedCard(names, numberText) {
  const cleanNames = names
    .map((name) => name.trim())
    .filter(Boolean);

  const collectorNumber =
    getScannedCollectorNumber(numberText);

  if (cleanNames.length === 0) {
    throw new Error(
      "The card name could not be read. Try again with the name clearly inside the guide."
    );
  }

  const nameResult =
    await findScannedCardsByName(cleanNames);

  if (
    nameResult.cards.length === 0 &&
    collectorNumber
  ) {
    const recoveredCard =
      await recoverCardFromNameAndNumber(
        cleanNames,
        collectorNumber
      );

    if (recoveredCard) {
      return {
        cards: [recoveredCard],
        query: `${recoveredCard.name} ${recoveredCard.number}`,
        usedCollectorNumber: true,
      };
    }
  }

  if (
    collectorNumber &&
    nameResult.cards.length > 0
  ) {
    const scannedNumber = String(
      Number(collectorNumber.split("/")[0])
    );

    const numberMatches =
      nameResult.cards.filter((card) =>
        String(Number(card.number)) === scannedNumber
      );

    if (numberMatches.length > 0) {
      return {
        cards: numberMatches,
        query: `${nameResult.matchedName} ${collectorNumber}`,
        usedCollectorNumber: true,
      };
    }
  }

  const fuzzyNumberMatch =
    findCardByFuzzyCollectorNumber(
      nameResult.cards,
      numberText
    );

  if (fuzzyNumberMatch) {
    return {
      cards: [fuzzyNumberMatch],
      query:
        `${nameResult.matchedName} ${fuzzyNumberMatch.number}`,
      usedCollectorNumber: true,
    };
  }

  return {
    cards: nameResult.cards,
    query: nameResult.matchedName || cleanNames[0],
    usedCollectorNumber: false,
  };
}

const PRICE_VARIANT_LABELS = {
  holofoil: "Holofoil",
  reverseHolofoil: "Reverse Holofoil",
  normal: "Non-Holo",
  firstEditionHolofoil: "1st Edition Holofoil",
  firstEditionNormal: "1st Edition Non-Holo",
  unlimitedHolofoil: "Unlimited Holofoil",
  unlimitedNormal: "Unlimited Non-Holo",
};

function getCardPriceVariants(card) {
  const prices = card.tcgplayer?.prices;

  if (!prices) {
    return [];
  }

  return Object.entries(prices)
    .map(([key, priceData]) => {
      const marketPrice = priceData?.market;

      if (typeof marketPrice !== "number") {
        return null;
      }

      return {
        key,
        label: PRICE_VARIANT_LABELS[key] || key,
        marketPrice,
      };
    })
    .filter(Boolean);
}

function getDefaultCardVariant(card) {
  const variants = getCardPriceVariants(card);

  return variants[0] || null;
}

function getCardMarketPrice(card) {
  const defaultVariant = getDefaultCardVariant(card);

  return defaultVariant?.marketPrice || 0;
}

function getCardVariant(card, variantKey) {
  const variants = getCardPriceVariants(card);

  return (
    variants.find((variant) => variant.key === variantKey) ||
    variants[0] ||
    null
  );
}

function buildVariantOptions(variants, selectedKey = "") {
  if (variants.length === 0) {
    return `<option value="">Market price unavailable</option>`;
  }

  return variants
    .map(
      (variant) => `
        <option
          value="${variant.key}"
          ${variant.key === selectedKey ? "selected" : ""}
        >
          ${variant.label} — ${formatMoney(variant.marketPrice)}
        </option>
      `
    )
    .join("");
}

function displayCards(cards) {
  currentSearchCards = cards;
  searchResults.innerHTML = "";

  cards.forEach((card) => {
    const cardElement = document.createElement("article");
    cardElement.className = "card-result";

    const variants = getCardPriceVariants(card);

    const variantMarkup =
      variants.length > 0
        ? variants
            .map(
              (variant) => `
                <p class="card-price">
                  ${variant.label}: ${formatMoney(variant.marketPrice)}
                </p>
              `
            )
            .join("")
        : `<p class="card-price">Market price unavailable</p>`;

    const defaultVariant = variants[0] || null;
    const tradeSideLabel =
      activeTradeSide === "your" ? "Your Side" : "Their Side";
    const tradeControlsMarkup = activeTradeSide
      ? `
          <div class="trade-result-controls">
            <label>
              Printing / Finish
              <select class="result-variant-select">
                ${buildVariantOptions(variants, defaultVariant?.key || "")}
              </select>
            </label>

            <button type="button" class="add-result-to-trade">
              + Add to ${tradeSideLabel}
            </button>
          </div>
        `
      : "";

    cardElement.innerHTML = `
      <div class="card-result-main">
        <img
          src="${card.images.small}"
          alt="${card.name}"
          loading="lazy"
        >

        <div class="card-result-info">
          <h3>${card.name}</h3>
          <p>${card.set.name}</p>
          <p>Card ${card.number}/${card.set.printedTotal}</p>

          <div class="price-variant-list">
            ${variantMarkup}
          </div>
        </div>
      </div>

      ${tradeControlsMarkup}
    `;

    const resultMain = cardElement.querySelector(".card-result-main");

    resultMain.addEventListener("click", () => {
      if (!activeTradeSide) {
        openCardDetail(card);
      }
    });

    const addToTradeButton =
      cardElement.querySelector(".add-result-to-trade");

    addToTradeButton?.addEventListener("click", () => {
      const variantSelect =
        cardElement.querySelector(".result-variant-select");

      addCardToTrade(card, variantSelect?.value || "");

      tradePanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });

    searchResults.appendChild(cardElement);
  });
}
function getRarityDisplay(rarity) {
  const rarityMap = {
    "Rare Ultra": {
      icon: "/assets/rarities/rare-ultra.svg",
      label: "Rare Ultra"
    }
  };

  return rarityMap[rarity] || {
    icon: "",
    label: rarity || "Unknown"
  };
}

function openCardDetail(card) {
  selectedCardData = card;

  const variants = getCardPriceVariants(card);
  const defaultVariant = variants[0] || null;

  selectedCardMarketPrice = defaultVariant?.marketPrice || 0;
  priceVariantSelect.innerHTML = buildVariantOptions(
    variants,
    defaultVariant?.key || ""
  );
  priceVariantSelect.disabled = variants.length === 0;
  priceVariantField.classList.toggle("hidden", variants.length === 0);

  selectedCardImage.src =
    card.images.large || card.images.small;

  selectedCardImage.alt = card.name;
  selectedCardName.textContent = card.name;
  selectedCardSet.textContent =
    card.set?.name || "Unknown Set";

  selectedCardNumber.textContent =
    `Card ${card.number || "?"}/${card.set?.printedTotal || "?"}`;

  const rarityDisplay = getRarityDisplay(card.rarity);

  selectedCardRarity.innerHTML = rarityDisplay.icon
    ? `
        <img
          class="rarity-icon"
          src="${rarityDisplay.icon}"
          alt="${rarityDisplay.label}"
        >
        <span>${rarityDisplay.label}</span>
      `
    : `<span>${rarityDisplay.label}</span>`;

  ebaySoldButton.onclick = () => {
    const cardType = cardTypeSelect.value;
    const grade = gradeSelect.value;
    const selectedVariant = getCardVariant(
      card,
      priceVariantSelect.value
    );

    let searchText =
      `${card.name} ${card.number} ${card.set?.name || ""}`;

    if (selectedVariant?.label) {
      searchText += ` ${selectedVariant.label}`;
    }

    if (cardType === "psa") {
      searchText += ` PSA ${grade}`;
    } else if (cardType === "bgs") {
      searchText += ` BGS ${grade}`;
    } else {
      searchText += " -PSA -BGS graded";
    }

    const search = encodeURIComponent(searchText);

    const ebayUrl =
      `https://www.ebay.com/sch/i.html?_nkw=${search}&LH_Sold=1&LH_Complete=1`;

    const ebayWindow = window.open(ebayUrl, "_blank");

    if (!ebayWindow) {
      alert(
        "Your browser blocked the eBay window. Please allow pop-ups for CompyDex and try again."
      );
    }
  };

  marketPrice.textContent =
    selectedCardMarketPrice > 0
      ? formatMoney(selectedCardMarketPrice)
      : "Unavailable";

  conditionSelect.value = "1";

  finalCompInput.value =
    selectedCardMarketPrice > 0
      ? selectedCardMarketPrice.toFixed(2)
      : "";

  cardTypeSelect.value = "raw";
  gradeSelect.value = "10";

  updateCardTypeFields();
  updateConditionValue();

  cardDetailPanel.classList.remove("hidden");

  cardDetailPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

priceVariantSelect.addEventListener("change", () => {
  if (!selectedCardData) {
    return;
  }

  const selectedVariant = getCardVariant(
    selectedCardData,
    priceVariantSelect.value
  );

  selectedCardMarketPrice = selectedVariant?.marketPrice || 0;
  updateCardTypeFields();
});
function updateConditionValue() {
  const conditionMultiplier =
    Number(conditionSelect.value) || 1;

  const adjustedPrice =
    selectedCardMarketPrice * conditionMultiplier;

  conditionPrice.textContent =
    formatMoney(adjustedPrice);

  finalCompInput.value =
    adjustedPrice.toFixed(2);

  updateOfferAmount();
}

function updateOfferAmount() {
  const comp =
    Number(finalCompInput.value) || 0;

  const percentage =
    Number(percentageInput.value) || 0;

  const offer =
    comp * (percentage / 100);

  offerAmount.textContent =
    formatMoney(offer);
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}
const RECENT_CARDS_KEY = "compydexRecentCards";
const MAX_RECENT_CARDS = 5;

function saveRecentCard(card) {
  const recentCards = getRecentCards();

  const updatedCards = [
    card,
    ...recentCards.filter((recentCard) => recentCard.id !== card.id),
  ].slice(0, MAX_RECENT_CARDS);

  localStorage.setItem(
    RECENT_CARDS_KEY,
    JSON.stringify(updatedCards)
  );

  displayRecentCards();
}

function getRecentCards() {
  try {
    return JSON.parse(
      localStorage.getItem(RECENT_CARDS_KEY)
    ) || [];
  } catch (error) {
    console.error("Could not load recent cards:", error);
    return [];
  }
}

function displayRecentCards() {
  if (!recentCardsContainer) {
    return;
  }

  const recentCards = getRecentCards();

  if (recentCards.length === 0) {
    recentCardsContainer.innerHTML = "<p>Nothing yet...</p>";
    return;
  }

  recentCardsContainer.innerHTML = "";

  recentCards.forEach((card) => {
    const cardElement = document.createElement("button");
    const price = getCardMarketPrice(card);

    cardElement.className = "recent-card-item";

    cardElement.innerHTML = `
      <img
        src="${card.images.small}"
        alt="${card.name}"
        loading="lazy"
      >

      <div>
        <strong>${card.name}</strong>
        <span>${card.set.name} · ${card.number}</span>
        <span>
          ${
            price > 0
              ? formatMoney(price)
              : "Price unavailable"
          }
        </span>
      </div>
    `;

    cardElement.addEventListener("click", () => {
      openCardDetail(card);
    });

    recentCardsContainer.appendChild(cardElement);
  });
}

displayRecentCards();
function addCardToTrade(card, variantKey = "") {
  if (activeTradeSide !== "your" && activeTradeSide !== "their") {
    return;
  }

  const priceVariants = getCardPriceVariants(card);
  const selectedVariant =
    getCardVariant(card, variantKey);

  const cardData = {
  name: card.name,
  number: card.number,
  setName: card.set?.name || "",
  image: card.images.small,

  cardType: "raw",
  priceVariants,
  selectedVariantKey: selectedVariant?.key || "",
  selectedVariantLabel:
    selectedVariant?.label || "Market price unavailable",
  rawPrice: selectedVariant?.marketPrice || 0,
    
  priceSource: "tcg",
  ebayComp: 0,
    
  condition: "NM",

  gradingCompany: "PSA",
  grade: "10",
  gradedComp: 0,

  percentage: activeTradeSide === "their" ? 80 : 100
};

  if (activeTradeSide === "your") {
    yourTradeCardData.push(cardData);
  } else if (activeTradeSide === "their") {
    theirTradeCardData.push(cardData);
  }

  updateTradeDisplay();

  activeTradeSide = null;

  if (currentSearchCards.length > 0) {
    displayCards(currentSearchCards);
  }
}
const TRADE_CONDITION_MULTIPLIERS = {
  NM: 1,
  LP: 0.9,
  MP: 0.75,
  HP: 0.6,
  DMG: 0.4
};

function getTradeCardBaseValue(card) {
  if (card.cardType === "graded") {
    return Number(card.gradedComp) || 0;
  }

  const rawBasePrice =
    card.priceSource === "ebay"
      ? Number(card.ebayComp) || 0
      : card.rawPrice;

  const multiplier =
    TRADE_CONDITION_MULTIPLIERS[card.condition] ?? 1;

  return rawBasePrice * multiplier;
}

function getTradeCardAdjustedValue(card) {
  const baseValue = getTradeCardBaseValue(card);
  const percentage = Number(card.percentage) || 0;

  return baseValue * (percentage / 100);
}
function updateTradeDisplay() {
  const renderSide = (cards, container) => {
    if (cards.length === 0) {
      container.innerHTML =
        `<p class="trade-empty">No cards added yet.</p>`;
      return;
    }

container.innerHTML = cards
  .map((card, index) => `
    <div class="trade-card-item">
  <button
    type="button"
    class="trade-remove-card"
    data-card-index="${index}"
    aria-label="Remove ${card.name} from trade"
  >
    ×
  </button>
      <img
        src="${card.image}"
        alt="${card.name}"
      >

      <div class="trade-card-details">
        <strong>${card.name}</strong>

        <span>
          ${card.setName} · ${card.number}
        </span>
        ${card.priceVariants?.length > 0 ? `
          <label>
            Printing / Finish
            <select
              class="trade-variant-select"
              data-card-index="${index}"
            >
              ${buildVariantOptions(
                card.priceVariants,
                card.selectedVariantKey
              )}
            </select>
          </label>
        ` : `
          <span>Market price unavailable</span>
        `}
        <span class="trade-market-price">
          Market: ${formatMoney(card.rawPrice)}
        </span>
        <label>
  Card Type
  <select
    class="trade-card-type-select"
    data-card-index="${index}"
  >
    <option
      value="raw"
      ${card.cardType === "raw" ? "selected" : ""}
    >
      Raw
    </option>

    <option
      value="graded"
      ${card.cardType === "graded" ? "selected" : ""}
    >
      Graded
    </option>
  </select>
</label>
${card.cardType === "raw" ? `
  <label>
    Condition
    <select
      class="trade-condition-select"
      data-card-index="${index}"
    >
      <option value="NM" ${card.condition === "NM" ? "selected" : ""}>
        NM
      </option>

      <option value="LP" ${card.condition === "LP" ? "selected" : ""}>
        LP
      </option>

      <option value="MP" ${card.condition === "MP" ? "selected" : ""}>
        MP
      </option>

      <option value="HP" ${card.condition === "HP" ? "selected" : ""}>
        HP
      </option>

      <option value="DMG" ${card.condition === "DMG" ? "selected" : ""}>
        DMG
      </option>
    </select>
  </label>

  <label>
    Price Source
    <select
      class="trade-price-source-select"
      data-card-index="${index}"
    >
      <option
        value="tcg"
        ${card.priceSource === "tcg" ? "selected" : ""}
      >
        TCG Market
      </option>

      <option
        value="ebay"
        ${card.priceSource === "ebay" ? "selected" : ""}
      >
        eBay Sold Comp
      </option>
    </select>
  </label>

  ${card.priceSource === "ebay" ? `
    <label>
      eBay Comp
      <input
        class="trade-ebay-comp-input"
        data-card-index="${index}"
        type="number"
        min="0"
        step="0.01"
        value="${card.ebayComp}"
      >
    </label>
  ` : ""}
` : `
  <label>
    Grading Company
    <select
      class="trade-grading-company-select"
      data-card-index="${index}"
    >
      <option value="PSA" ${card.gradingCompany === "PSA" ? "selected" : ""}>
        PSA
      </option>

      <option value="BGS" ${card.gradingCompany === "BGS" ? "selected" : ""}>
        BGS
      </option>

      <option value="CGC" ${card.gradingCompany === "CGC" ? "selected" : ""}>
        CGC
      </option>

      <option value="SGC" ${card.gradingCompany === "SGC" ? "selected" : ""}>
        SGC
      </option>

      <option value="TAG" ${card.gradingCompany === "TAG" ? "selected" : ""}>
        TAG
      </option>
    </select>
  </label>

  <label>
    Grade
    <input
      class="trade-grade-input"
      data-card-index="${index}"
      type="number"
      min="1"
      max="10"
      step="0.5"
      value="${card.grade}"
    >
  </label>

  <label>
    eBay Graded Comp
    <input
      class="trade-graded-comp-input"
      data-card-index="${index}"
      type="number"
      min="0"
      step="0.01"
      value="${card.gradedComp}"
    >
  </label>
`}
        <label>
          Buy %
          <input
            class="trade-percentage-input"
            type="number"
            min="0"
            max="100"
            step="0.5"
            value="${card.percentage}"
            data-card-index="${index}"
          >
        </label>

        <p>
          Value:
          ${formatMoney(
            getTradeCardAdjustedValue(card)
          )}
        </p>
      </div>
    </div>
  `)
  .join("");
  };

  renderSide(yourTradeCardData, yourTradeCards);
  renderSide(theirTradeCardData, theirTradeCards);
  yourTradeCards.insertAdjacentHTML(
  "beforeend",
  `
    <div class="trade-cash">
      <label>
        Cash
        <input
          class="trade-cash-input"
          data-side="your"
          type="number"
          min="0"
          step="1"
          value="${yourCashAdjustment}"
        >
      </label>
    </div>
`
);

theirTradeCards.insertAdjacentHTML(
  "beforeend",
  `
    <div class="trade-cash">
      <label>
        Cash
        <input
          class="trade-cash-input"
          data-side="their"
          type="number"
          min="0"
          step="1"
          value="${theirCashAdjustment}"
        >
      </label>
    </div>
`
);
 document
  .querySelectorAll(".trade-cash-input")
  .forEach((input) => {
    input.addEventListener("change", () => {
      const value = Number(input.value) || 0;

      if (input.dataset.side === "your") {
        yourCashAdjustment = value;
      } else {
        theirCashAdjustment = value;
      }

      updateTradeDisplay();
    });
  });

document
  .querySelectorAll(".trade-remove-card")
  .forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.cardIndex);

      const isYourSide =
        button.closest("#yourTradeCards");

      if (isYourSide) {
        yourTradeCardData.splice(index, 1);
      } else {
        theirTradeCardData.splice(index, 1);
      }

      updateTradeDisplay();
    });
  });
  
  document
  .querySelectorAll(".trade-variant-select")
  .forEach((select) => {
    select.addEventListener("change", () => {
      const index = Number(select.dataset.cardIndex);
      const card =
        select.closest("#yourTradeCards")
          ? yourTradeCardData[index]
          : theirTradeCardData[index];

      if (!card) {
        return;
      }

      const selectedVariant = card.priceVariants.find(
        (variant) => variant.key === select.value
      );

      card.selectedVariantKey = selectedVariant?.key || "";
      card.selectedVariantLabel =
        selectedVariant?.label || "Market price unavailable";
      card.rawPrice = selectedVariant?.marketPrice || 0;
      updateTradeDisplay();
    });
  });

  document
  .querySelectorAll(".trade-card-type-select")
  .forEach((select) => {
    select.addEventListener("change", () => {
      const index = Number(select.dataset.cardIndex);

      const card =
        select.closest("#yourTradeCards")
          ? yourTradeCardData[index]
          : theirTradeCardData[index];

      if (!card) {
        return;
      }

      card.cardType = select.value;
      updateTradeDisplay();
    });
  });
  
document
  .querySelectorAll(".trade-price-source-select")
  .forEach((select) => {
    select.addEventListener("change", () => {
      const index = Number(select.dataset.cardIndex);

      const card =
        select.closest("#yourTradeCards")
          ? yourTradeCardData[index]
          : theirTradeCardData[index];

      if (!card) {
        return;
      }

      card.priceSource = select.value;
      updateTradeDisplay();
    });
  });

document
  .querySelectorAll(".trade-ebay-comp-input")
  .forEach((input) => {
    input.addEventListener("change", () => {
      const index = Number(input.dataset.cardIndex);

      const card =
        input.closest("#yourTradeCards")
          ? yourTradeCardData[index]
          : theirTradeCardData[index];

      if (!card) {
        return;
      }

      card.ebayComp = Number(input.value) || 0;
      updateTradeDisplay();
    });
  });

document
  .querySelectorAll(".trade-condition-select")
  .forEach((select) => {
    select.addEventListener("change", () => {
      const index = Number(select.dataset.cardIndex);

      const card =
        select.closest("#yourTradeCards")
          ? yourTradeCardData[index]
          : theirTradeCardData[index];

      if (!card) {
        return;
      }

      card.condition = select.value;
      updateTradeDisplay();
    });
  });

document
  .querySelectorAll(".trade-percentage-input")
  .forEach((input) => {
    input.addEventListener("change", () => {
      const index = Number(input.dataset.cardIndex);
      const percentage = Number(input.value) || 0;

      const card =
        input.closest("#yourTradeCards")
          ? yourTradeCardData[index]
          : theirTradeCardData[index];

      if (!card) {
        return;
      }

      card.percentage = percentage;
      updateTradeDisplay();
    });
  }); 

 const yourTotal = yourTradeCardData.reduce(
  (total, card) =>
    total + getTradeCardAdjustedValue(card),
  0
);

 const theirTotal = theirTradeCardData.reduce(
  (total, card) =>
    total + getTradeCardAdjustedValue(card),
  0
);

  const adjustedYourTotal =
  yourTotal + yourCashAdjustment;

const adjustedTheirTotal =
  theirTotal + theirCashAdjustment;

const difference =
  adjustedYourTotal - adjustedTheirTotal;

  yourTradeTotal.textContent =
  formatMoney(adjustedYourTotal);

theirTradeTotal.textContent =
  formatMoney(adjustedTheirTotal);
  tradeDifference.textContent =
    formatMoney(Math.abs(difference));

  if (Math.abs(difference) < 0.01) {
    tradeStatus.textContent = "⚪ Even Trade";
  } else if (difference > 0) {
    tradeStatus.textContent =
      `🟢 Your Side is ahead by ${formatMoney(difference)}`;
  } else {
    tradeStatus.textContent =
      `🔴 Their Side is ahead by ${formatMoney(
        Math.abs(difference)
      )}`;
  }
}

let scannerStream = null;
let scannerTorchOn = false;
let scannerScanInProgress = false;
let scannerOcrWorkersPromise = null;

function prepareScannerOcrWorkers() {
  if (!scannerOcrWorkersPromise) {
    scannerOcrWorkersPromise = (async () => {
      const workers = await Promise.all([
        Tesseract.createWorker("eng"),
        Tesseract.createWorker("eng"),
      ]);

      await workers[1].setParameters({
        tessedit_char_whitelist: "0123456789/",
        tessedit_pageseg_mode:
          Tesseract.PSM.SINGLE_BLOCK,
      });

      return workers;
    })().catch((error) => {
      scannerOcrWorkersPromise = null;
      throw error;
    });
  }

  return scannerOcrWorkersPromise;
}

function updateScannerLightControls(torchAvailable) {
  const torchButton =
    document.getElementById("scannerTorchButton");

  torchButton.disabled = !torchAvailable;
  torchButton.classList.toggle("active", scannerTorchOn);
  torchButton.setAttribute("aria-pressed", String(scannerTorchOn));
  torchButton.textContent = torchAvailable
    ? `🔦 ${scannerTorchOn ? "On" : "Off"}`
    : "🔦 Unavailable";
}

async function toggleScannerTorch() {
  const videoTrack = scannerStream?.getVideoTracks?.()[0];
  const capabilities = videoTrack?.getCapabilities?.() || {};

  if (!videoTrack || !capabilities.torch) {
    updateScannerLightControls(false);
    return;
  }

  const nextTorchState = !scannerTorchOn;

  try {
    await videoTrack.applyConstraints({
      advanced: [{ torch: nextTorchState }]
    });
    scannerTorchOn = nextTorchState;

    updateScannerLightControls(true);
  } catch (error) {
    console.error("Flashlight error:", error);
    updateScannerLightControls(false);
  }
}

document
  .getElementById("scannerTorchButton")
  .addEventListener("click", toggleScannerTorch);

async function openScanner() {
  const scannerModal =
    document.getElementById("scannerModal");

  const scannerVideo =
    document.getElementById("scannerVideo");

  const scannerStatus =
    document.getElementById("scannerStatus");
  const scannerPreview =
    document.getElementById("scannerPreview");
  const captureButton =
    document.getElementById("capturePhoto");
  const cancelButton =
    document.getElementById("cancelScanner");

  scannerPreview.classList.add("hidden");
  scannerVideo.classList.remove("hidden");
  captureButton.disabled = true;
  captureButton.textContent = "Focusing...";
  cancelButton.textContent = "Cancel";

  if (scannerStatus) {
    scannerStatus.classList.remove("hidden");
    scannerStatus.textContent = "Starting camera...";
  }

  try {
    scannerStream =
      await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: "environment"
          },
          width: {
            ideal: 1920
          },
          height: {
            ideal: 1080
          },
          frameRate: {
            ideal: 30
          }
        },
        audio: false
      });

    scannerVideo.srcObject = scannerStream;

    await scannerVideo.play();

    if (scannerVideo.readyState < 2) {
      await new Promise((resolve) => {
        scannerVideo.onloadedmetadata = () => {
          resolve();
        };
      });
    }

    scannerModal.classList.remove("hidden");

    // Load OCR while the user positions the card instead of waiting until
    // after the photo is accepted.
    prepareScannerOcrWorkers().catch((error) => {
      console.error("OCR preload error:", error);
    });

    await new Promise((resolve) =>
      setTimeout(resolve, 900)
    );

    if (scannerStatus) {
      scannerStatus.classList.add("hidden");
    }

    captureButton.disabled = false;
    captureButton.textContent = "📸 Capture";

    scannerTorchOn = false;

    const videoTrack = scannerStream.getVideoTracks()[0];
    const capabilities = videoTrack?.getCapabilities?.() || {};
    updateScannerLightControls(Boolean(capabilities.torch));

  } catch (error) {
    console.error("Camera error:", error);

    if (scannerStatus) {
      scannerStatus.classList.add("hidden");
    }

    captureButton.disabled = false;
    captureButton.textContent = "📸 Capture";

    alert(
      "CompyDex could not access the camera.\n\n" +
      "Please allow camera permission and try again."
    );
  }
}
function closeScanner() {
    const scannerModal = document.getElementById("scannerModal");
    const scannerVideo = document.getElementById("scannerVideo");

    if (scannerStream) {
        scannerStream.getTracks().forEach((track) => {
            track.stop();
        });

        scannerStream = null;
    }

    scannerVideo.srcObject = null;
    scannerTorchOn = false;
    updateScannerLightControls(false);

  scannerModal.classList.add("hidden");
}

document
  .getElementById("cancelScanner")
  .addEventListener("click", () => {
    const scannerPreview =
      document.getElementById("scannerPreview");

    const cancelButton =
      document.getElementById("cancelScanner");

    // Normal live-camera state: this button is Cancel.
    if (scannerPreview.classList.contains("hidden")) {
      closeScanner();
      return;
    }

    // Captured-photo state: this button is Use Photo.
    if (scannerScanInProgress) {
      searchStatus.textContent =
        "A card scan is already processing. Please wait.";
      closeScanner();
      return;
    }

    scannerScanInProgress = true;
    window.compydexCapturedImage = scannerPreview.src;
    const makeOcrCrop = (
  image,
  xRatio,
  yRatio,
  widthRatio,
  heightRatio,
  scale = 3
) => {
  const cropCanvas = document.createElement("canvas");

  const sourceX = image.naturalWidth * xRatio;
  const sourceY = image.naturalHeight * yRatio;
  const sourceWidth = image.naturalWidth * widthRatio;
  const sourceHeight = image.naturalHeight * heightRatio;

  cropCanvas.width = sourceWidth * scale;
  cropCanvas.height = sourceHeight * scale;

  const cropContext = cropCanvas.getContext("2d");

  cropContext.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    cropCanvas.width,
    cropCanvas.height
  );

  return cropCanvas;
};

const makeStackedOcrCrop = (
  image,
  zones,
  scale = 4
) => {
  const crops = zones.map((zone) =>
    makeOcrCrop(
      image,
      zone.x,
      zone.y,
      zone.width,
      zone.height,
      scale
    )
  );

  const gap = 16;
  const stackedCanvas = document.createElement("canvas");
  stackedCanvas.width = Math.max(
    ...crops.map((crop) => crop.width)
  );
  stackedCanvas.height =
    crops.reduce((total, crop) => total + crop.height, 0) +
    gap * (crops.length - 1);

  const stackedContext = stackedCanvas.getContext("2d");
  stackedContext.fillStyle = "white";
  stackedContext.fillRect(
    0,
    0,
    stackedCanvas.width,
    stackedCanvas.height
  );

  let destinationY = 0;

  crops.forEach((crop) => {
    stackedContext.drawImage(crop, 0, destinationY);
    destinationY += crop.height + gap;
  });

  return stackedCanvas;
};

// Tight band around the large Pokémon name.
const primaryNameCrop = makeOcrCrop(
  scannerPreview,
  0.18,
  0.14,
  0.58,
  0.08
);

// Wider fallback band for cards whose name row sits higher or lower.
const fallbackNameCrop = makeOcrCrop(
  scannerPreview,
  0.18,
  0.10,
  0.58,
  0.10
);

const numberBandYPositions = [0.72, 0.78, 0.84];

// Collector numbers move vertically when a card is tilted or does not fill
// the guide. Stack three narrow bands so one OCR pass can inspect all of them.
const leftNumberCrop = makeStackedOcrCrop(
  scannerPreview,
  numberBandYPositions.map((y) => ({
    x: 0.06,
    y,
    width: 0.36,
    height: 0.07,
  }))
);

const rightNumberCrop = makeStackedOcrCrop(
  scannerPreview,
  numberBandYPositions.map((y) => ({
    x: 0.58,
    y,
    width: 0.36,
    height: 0.07,
  }))
);

const prepareNumberCrop = (cropCanvas) => {
  const numberContext =
    cropCanvas.getContext("2d");

  const numberImage =
    numberContext.getImageData(
    0,
    0,
    cropCanvas.width,
    cropCanvas.height
  );

  const pixels = numberImage.data;

  for (let i = 0; i < pixels.length; i += 4) {
    const gray =
      pixels[i] * 0.299 +
      pixels[i + 1] * 0.587 +
      pixels[i + 2] * 0.114;

    const contrasted = Math.max(
      0,
      Math.min(255, 128 + (gray - 128) * 2.2)
    );

    pixels[i] = contrasted;
    pixels[i + 1] = contrasted;
    pixels[i + 2] = contrasted;
  }

  numberContext.putImageData(
    numberImage,
    0,
    0
  );
};

prepareNumberCrop(leftNumberCrop);
prepareNumberCrop(rightNumberCrop);
       
(async () => {
  let nameWorker;
  let numberWorker;

  try {
    searchStatus.textContent = "Reading card...";
    searchResults.innerHTML = "";

    [nameWorker, numberWorker] =
      await prepareScannerOcrWorkers();

    const readNames = async () => {
      const primary =
        await nameWorker.recognize(primaryNameCrop);
      const fallback =
        await nameWorker.recognize(fallbackNameCrop);

      return [primary, fallback];
    };

    const readNumbers = async () => {
      const left =
        await numberWorker.recognize(leftNumberCrop);
      const right =
        await numberWorker.recognize(rightNumberCrop);

      return [left, right];
    };

    const [nameResults, numberResults] =
      await Promise.all([
        readNames(),
        readNumbers(),
      ]);

    const [primaryNameResult, fallbackNameResult] =
      nameResults;
    const [leftNumberResult, rightNumberResult] =
      numberResults;

    const nameText = [
      primaryNameResult.data.text,
      fallbackNameResult.data.text,
    ].join("\n").trim();

    const numberText = [
      leftNumberResult.data.text,
      rightNumberResult.data.text,
    ].join("\n").trim();

    const scannedNames =
      getScannedCardNames(nameText);

    // Show what OCR detected even if the API request later fails.
    searchInput.value = scannedNames[0] || "";

    const scanResult =
      await searchScannedCard(scannedNames, numberText);

    searchInput.value = scanResult.query;

    if (scanResult.cards.length === 0) {
      searchStatus.textContent =
        "No exact match found. Check the detected name and card number, then search again.";
      return;
    }

    if (
      !scanResult.usedCollectorNumber &&
      scanResult.cards.length > 1
    ) {
      const detectedName = scanResult.query.trim();

      searchInput.value = `${detectedName} `;
      searchResults.innerHTML = "";
      searchStatus.textContent =
        `${detectedName} found. Enter the card number ` +
        "(example: 29), then tap Search.";

      searchPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      setTimeout(() => searchInput.focus(), 350);
      return;
    }

    searchStatus.textContent =
      `${scanResult.cards.length} card${
        scanResult.cards.length === 1 ? "" : "s"
      } found${
        scanResult.usedCollectorNumber
          ? " using the scanned collector number"
          : " using the scanned name"
      }`;

    displayCards(scanResult.cards);

    searchPanel.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  } catch (error) {
    console.error("OCR ERROR:", error);
    if (error.isScanReadError) {
      searchInput.value = "";
      searchStatus.textContent = error.message;
    } else {
      searchStatus.textContent =
        `Scan failed: ${error.message} ` +
        "The detected name was kept—tap Search to retry.";
    }
  } finally {
    scannerScanInProgress = false;
  }
})();
    
    cancelButton.textContent = "Cancel";

    closeScanner();

    console.log("Captured card image saved for identification.");
  });

let scannerMode = "manual";

const manualModeButton =
  document.getElementById("manualModeButton");

const autoModeButton =
  document.getElementById("autoModeButton");

manualModeButton.addEventListener("click", () => {
  scannerMode = "manual";
  stopAutoCapture();

  manualModeButton.classList.add("active");
  autoModeButton.classList.remove("active");
});
let autoCaptureTimer = null;
let stableFrameCount = 0;

function stopAutoCapture() {
  if (autoCaptureTimer) {
    clearInterval(autoCaptureTimer);
    autoCaptureTimer = null;
  }
}
autoModeButton.addEventListener("click", () => {
  scannerMode = "auto";
  stopAutoCapture();

const scannerVideo =
  document.getElementById("scannerVideo");

const scannerPreview =
  document.getElementById("scannerPreview");

autoCaptureTimer = setInterval(() => {
  if (scannerMode !== "auto") {
    stopAutoCapture();
    return;
  }

  if (!scannerPreview.classList.contains("hidden")) {
    stopAutoCapture();
    return;
  }

  if (!scannerVideo.videoWidth || !scannerVideo.videoHeight) {
    return;
  }

  const scannerCanvas =
  document.getElementById("scannerCanvas");

const context =
  scannerCanvas.getContext("2d", {
    willReadFrequently: true
  });

const sampleWidth = 80;
const sampleHeight = 112;

scannerCanvas.width = sampleWidth;
scannerCanvas.height = sampleHeight;

const videoWidth = scannerVideo.videoWidth;
const videoHeight = scannerVideo.videoHeight;

// Sample only the center portion of the camera,
// roughly matching the purple card guide.
const guideWidth = videoWidth * 0.55;
const guideHeight = videoHeight * 0.72;

const guideX = (videoWidth - guideWidth) / 2;
const guideY = (videoHeight - guideHeight) / 2;

context.drawImage(
  scannerVideo,
  guideX,
  guideY,
  guideWidth,
  guideHeight,
  0,
  0,
  sampleWidth,
  sampleHeight
);

const currentFrame =
  context.getImageData(
    0,
    0,
    sampleWidth,
    sampleHeight
  );

if (!window.lastAutoFrame) {
  window.lastAutoFrame = currentFrame;
  return;
}

let difference = 0;

for (
  let i = 0;
  i < currentFrame.data.length;
  i += 16
) {
  difference += Math.abs(
    currentFrame.data[i] -
    window.lastAutoFrame.data[i]
  );
}

window.lastAutoFrame = currentFrame;

const movementScore =
  difference /
  (currentFrame.data.length / 16);

// Estimate the overall brightness of the frame.
// This gives Auto mode a basic "something usable is here" check.
let brightnessTotal = 0;
let brightnessSamples = 0;

for (let i = 0; i < currentFrame.data.length; i += 4) {
  brightnessTotal +=
    (
      currentFrame.data[i] +
      currentFrame.data[i + 1] +
      currentFrame.data[i + 2]
    ) / 3;

  brightnessSamples += 1;
}

const brightness =
  brightnessTotal / brightnessSamples;

// Measure how much visual detail exists inside the card guide.
// A real trading card should have plenty of light/dark variation.
let detailTotal = 0;
let detailSamples = 0;

for (
  let i = 0;
  i < currentFrame.data.length - 16;
  i += 16
) {
  const current =
    currentFrame.data[i];

  const next =
    currentFrame.data[i + 16];

  detailTotal += Math.abs(current - next);
  detailSamples += 1;
}

const detailScore =
  detailSamples > 0
    ? detailTotal / detailSamples
    : 0;

function getRegionDetail(xStart, yStart, xEnd, yEnd) {
  let total = 0;
  let samples = 0;

  for (let y = yStart; y < yEnd; y += 2) {
    for (let x = xStart; x < xEnd - 1; x += 2) {
      const index =
        (y * sampleWidth + x) * 4;

      const nextIndex =
        (y * sampleWidth + (x + 1)) * 4;

      const current =
        currentFrame.data[index];

      const next =
        currentFrame.data[nextIndex];

      total += Math.abs(current - next);
      samples += 1;
    }
  }

  return samples > 0
    ? total / samples
    : 0;
}

const topDetail =
  getRegionDetail(
    0,
    0,
    sampleWidth,
    Math.floor(sampleHeight * 0.25)
  );

const bottomDetail =
  getRegionDetail(
    0,
    Math.floor(sampleHeight * 0.75),
    sampleWidth,
    sampleHeight
  );

const leftDetail =
  getRegionDetail(
    0,
    0,
    Math.floor(sampleWidth * 0.25),
    sampleHeight
  );

const rightDetail =
  getRegionDetail(
    Math.floor(sampleWidth * 0.75),
    0,
    sampleWidth,
    sampleHeight
  );

const cardLikelyPresent =
  brightness > 45 &&
  brightness < 220 &&
  detailScore > 8 &&
  topDetail > 5 &&
  bottomDetail > 5 &&
  leftDetail > 5 &&
  rightDetail > 5;

// Allow normal handheld movement.
if (cardLikelyPresent) {
  if (movementScore <= 14) {
    stableFrameCount += 1;
  } else {
    stableFrameCount = Math.max(
      0,
      stableFrameCount - 1
    );
  }
} else {
  stableFrameCount = 0;
}

if (stableFrameCount >= 2) {
  stableFrameCount = 0;
  stopAutoCapture();

  document
    .getElementById("capturePhoto")
    .click();
}
  
const scannerStatus =
  document.getElementById("scannerStatus");

if (scannerStatus) {
  scannerStatus.classList.remove("hidden");

  if (!cardLikelyPresent) {
    scannerStatus.textContent = "Align card in frame";
  } else if (movementScore > 14) {
    scannerStatus.textContent = "Hold steady";
  } else {
    scannerStatus.textContent = "Card detected";
  }
}

}, 250);

  autoModeButton.classList.add("active");
  manualModeButton.classList.remove("active");
});

document
  .getElementById("capturePhoto")
  .addEventListener("click", () => {
    const scannerVideo =
      document.getElementById("scannerVideo");

    const scannerCanvas =
      document.getElementById("scannerCanvas");

    const scannerPreview =
      document.getElementById("scannerPreview");

    const captureButton =
      document.getElementById("capturePhoto");

    const cancelButton =
      document.getElementById("cancelScanner");

    // If we're showing a captured photo,
    // this button acts as RETAKE.
    if (!scannerPreview.classList.contains("hidden")) {
      scannerPreview.classList.add("hidden");
      scannerVideo.classList.remove("hidden");

      captureButton.textContent = "📸 Capture";
      cancelButton.textContent = "Cancel";

      return;
    }

    // Capture the live camera frame.
    if (!scannerVideo.videoWidth || !scannerVideo.videoHeight) {
      return;
    }

    const videoWidth = scannerVideo.videoWidth;
const videoHeight = scannerVideo.videoHeight;

const frameWidth = scannerVideo.clientWidth;
const frameHeight = scannerVideo.clientHeight;

const videoRatio = videoWidth / videoHeight;
const frameRatio = frameWidth / frameHeight;

let sourceX = 0;
let sourceY = 0;
let sourceWidth = videoWidth;
let sourceHeight = videoHeight;

if (videoRatio > frameRatio) {
  sourceWidth = videoHeight * frameRatio;
  sourceX = (videoWidth - sourceWidth) / 2;
} else {
  sourceHeight = videoWidth / frameRatio;
  sourceY = (videoHeight - sourceHeight) / 2;
}

scannerCanvas.width = Math.round(sourceWidth);
scannerCanvas.height = Math.round(sourceHeight);

const context = scannerCanvas.getContext("2d");

context.drawImage(
  scannerVideo,
  sourceX,
  sourceY,
  sourceWidth,
  sourceHeight,
  0,
  0,
  scannerCanvas.width,
  scannerCanvas.height
);

    const imageData =
      scannerCanvas.toDataURL("image/jpeg", 0.92);

    scannerPreview.src = imageData;

    scannerVideo.classList.add("hidden");
    scannerPreview.classList.remove("hidden");

    captureButton.textContent = "↩ Retake";
    cancelButton.textContent = "✓ Use Photo";
  });
