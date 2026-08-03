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
const finalCompInput = document.getElementById("finalCompInput");
const percentageInput = document.getElementById("percentageInput");
const offerAmount = document.getElementById("offerAmount");
const recentCardsContainer = document.getElementById("recentCards");
const ebaySoldButton = document.getElementById("ebaySoldButton");


let selectedCardMarketPrice = 0;

scanButton.addEventListener("click", () => {
  alert("Camera scanner is next.");
});

function updateCardTypeFields() {
  const isRaw = cardTypeSelect.value === "raw";

  conditionField.style.display = isRaw ? "" : "none";
  gradeField.style.display = isRaw ? "none" : "";

  if (isRaw) {
    marketPrice.textContent =
      selectedCardMarketPrice > 0
        ? formatMoney(selectedCardMarketPrice)
        : "Unavailable";

    updateConditionValue();
  } else {
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
      openCardDetail(card);
    });

    searchResults.appendChild(cardElement);
  });
}

function openCardDetail(card) {
  selectedCardMarketPrice = getCardMarketPrice(card);

  selectedCardImage.src =
    card.images.large || card.images.small;

  selectedCardImage.alt = card.name;
  selectedCardName.textContent = card.name;
  selectedCardSet.textContent = card.set.name;
  ebaySoldButton.onclick = () => {
  const cardType = cardTypeSelect.value;
  const grade = gradeSelect.value;

  let searchText = `${card.name} ${card.number} ${card.set.name}`;
  let ebayFilters = "&LH_Sold=1&LH_Complete=1";

  if (cardType === "raw") {
    searchText += " raw ungraded";
    ebayFilters += "&LH_ItemCondition=3000";
  } else {
    searchText = `${cardType.toUpperCase()} ${grade} ${searchText}`;
  }

  const search = encodeURIComponent(searchText);

  const ebayUrl =
    `https://www.ebay.com/sch/i.html?_nkw=${search}${ebayFilters}`;

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
    selectedCardMarketPrice.toFixed(2);

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
