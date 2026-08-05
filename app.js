const scanButton = document.getElementById("scanButton");

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

let selectedCardMarketPrice = 0;
let activeTradeSide = null;
let yourTradeCardData = [];
let theirTradeCardData = [];
let yourCashAdjustment = 0;
let theirCashAdjustment = 0;

scanButton.addEventListener("click", () => {
  alert("Camera scanner is next.");
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

  searchInput.focus();

  searchPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});
closeTradeButton.addEventListener("click", () => {
  tradePanel.classList.add("hidden");
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

function displayCards(cards) {
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

    cardElement.innerHTML = `
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
    `;

    cardElement.addEventListener("click", () => {
    if (activeTradeSide) {
        addCardToTrade(card);
        tradePanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    } else {
        openCardDetail(card);
    }
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
  selectedCardMarketPrice = getCardMarketPrice(card);

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

    let searchText =
      `${card.name} ${card.number} ${card.set?.name || ""}`;

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
function addCardToTrade(card) {
  const cardData = {
  name: card.name,
  number: card.number,
  setName: card.set?.name || "",
  image: card.images.small,

  cardType: "raw",
  rawPrice: getCardMarketPrice(card),
    
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
