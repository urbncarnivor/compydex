const scanButton = document.getElementById("scanButton");
const searchButton = document.getElementById("searchButton");

const searchPanel = document.getElementById("searchPanel");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchStatus = document.getElementById("searchStatus");
const searchResults = document.getElementById("searchResults");

searchButton.addEventListener("click", () => {
  searchPanel.classList.toggle("hidden");

  if (!searchPanel.classList.contains("hidden")) {
    searchInput.focus();
  }
});

scanButton.addEventListener("click", () => {
  alert("Camera scanner is next.");
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

    searchStatus.textContent = `${cards.length} cards found`;
    displayCards(cards);
  } catch (error) {
    console.error(error);

    searchStatus.textContent =
      "Search failed. Please check your connection and try again.";
  }
});

async function searchCards(query) {
  const words = query
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const numberWord = words.find((word) =>
    /^\d{1,4}(?:\/\d{1,4})?$/.test(word)
  );

  const nameWords = words.filter((word) => word !== numberWord);

  const searchParts = [];

  if (nameWords.length > 0) {
    const cardName = nameWords.join(" ").toLowerCase();
    searchParts.push(`name:${cardName}*`);
  }

  if (numberWord) {
    const cardNumber = numberWord.split("/")[0];
    searchParts.push(`number:${cardNumber}`);
  }

  const apiQuery = searchParts.join(" ");

  const url =
    "https://api.pokemontcg.io/v2/cards" +
    `?q=${encodeURIComponent(apiQuery)}` +
    "&pageSize=100" +
    "&orderBy=-set.releaseDate";

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `API error ${response.status}: ${errorText}`
    );
  }

  const result = await response.json();

  let cards = result.data || [];

  if (numberWord) {
    const exactNumber = numberWord.split("/")[0];

    cards = cards
      .filter((card) => String(card.number) === exactNumber)
      .sort((a, b) => {
        const aExact =
          a.name.toLowerCase() === nameWords.join(" ").toLowerCase();

        const bExact =
          b.name.toLowerCase() === nameWords.join(" ").toLowerCase();

        return Number(bExact) - Number(aExact);
      });
  }

  return cards.slice(0, 20);
}

function displayCards(cards) {
  searchResults.innerHTML = "";

  cards.forEach((card) => {
    const cardElement = document.createElement("article");
    cardElement.className = "card-result";

    const price =
      card.tcgplayer?.prices?.holofoil?.market ??
      card.tcgplayer?.prices?.reverseHolofoil?.market ??
      card.tcgplayer?.prices?.normal?.market ??
      null;

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
        <p class="card-price">
          ${price !== null
            ? `Market: $${price.toFixed(2)}`
            : "Market price unavailable"}
        </p>
      </div>
    `;

    cardElement.addEventListener("click", () => {
      console.log("Selected card:", card);
    });

    searchResults.appendChild(cardElement);
  });
}
