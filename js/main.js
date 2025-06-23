const pokemonName = document.querySelector(".pokemon__name");
const pokemonNumber = document.querySelector(".pokemon__number");
const pokemonImage = document.querySelector(".pokemon__image");


let pokemonTypes = document.querySelector(".pokemon__types");
let pokemonStats = document.querySelector(".pokemon__stats");


if (!pokemonTypes) {
  pokemonTypes = document.createElement("div");
  pokemonTypes.className = "pokemon__types";
  pokemonImage.insertAdjacentElement("afterend", pokemonTypes);
}
if (!pokemonStats) {
  pokemonStats = document.createElement("div");
  pokemonStats.className = "pokemon__stats";
  pokemonTypes.insertAdjacentElement("afterend", pokemonStats);
}

const form = document.querySelector(".form");
const input = document.querySelector(".input__search");
const buttonPrev = document.querySelector(".btn-prev");
const buttonNext = document.querySelector(".btn-next");
const buttonSearch = form.querySelector('button[type="submit"]');

let searchPokemon = 25;
const cache = {};

function setLoadingState(isLoading) {
  buttonPrev.disabled = isLoading;
  buttonNext.disabled = isLoading;
  buttonSearch.disabled = isLoading;
  input.disabled = isLoading;

  if (isLoading) {
    pokemonName.textContent = "Loading...";
    pokemonNumber.textContent = "";
    pokemonTypes.textContent = "";
    pokemonStats.innerHTML = "";
    pokemonImage.style.opacity = 0.5;
  } else {
    pokemonImage.style.opacity = 1;
  }
}

async function fetchPokemon(pokemon) {
  pokemon = pokemon.toString().toLowerCase().trim();

  if (cache[pokemon]) return cache[pokemon];

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
    if (!res.ok) return null;
    const data = await res.json();
    cache[pokemon] = data;
    return data;
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
}

async function renderPokemon(pokemon) {
  if (!pokemon || pokemon.toString().trim() === "") {
    alert("Please enter a Pokémon name or number.");
    return;
  }

  pokemon = pokemon.toString().trim().toLowerCase();

  setLoadingState(true);

  const data = await fetchPokemon(pokemon);

  if (data) {
    pokemonImage.style.display = "block";
    pokemonName.textContent = capitalize(data.name);
    pokemonNumber.textContent = `#${data.id.toString().padStart(3, "0")}`;

    pokemonImage.src =
      data.sprites.versions["generation-v"]["black-white"]["animated"]["front_default"] ||
      data.sprites.front_default ||
      "";

    pokemonTypes.textContent =
      "Type: " + data.types.map(t => capitalize(t.type.name)).join(", ");

    pokemonStats.innerHTML = data.stats
      .filter(stat => ["hp", "attack", "defense"].includes(stat.stat.name))
      .map(
        stat =>
          `<div class="stat"><strong>${capitalize(stat.stat.name)}:</strong> ${stat.base_stat}</div>`
      )
      .join("");

    input.value = "";
    searchPokemon = data.id;
  } else {
    pokemonImage.style.display = "none";
    pokemonName.textContent = "Not Found :C";
    pokemonNumber.textContent = "";
    pokemonTypes.textContent = "";
    pokemonStats.innerHTML = "";
  }

  setLoadingState(false);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

form.addEventListener("submit", e => {
  e.preventDefault();
  renderPokemon(input.value);
});

buttonPrev.addEventListener("click", () => {
  if (searchPokemon > 1) {
    renderPokemon(--searchPokemon);
  }
});

buttonNext.addEventListener("click", () => {
  renderPokemon(++searchPokemon);
});

window.addEventListener("keydown", e => {
  if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

  if (e.key === "ArrowLeft" && searchPokemon > 1) {
    renderPokemon(--searchPokemon);
  }
  if (e.key === "ArrowRight") {
    renderPokemon(++searchPokemon);
  }
});

renderPokemon(searchPokemon);
