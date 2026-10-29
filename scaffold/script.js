const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const results = document.getElementById("results");
const status = document.getElementById("status");

const API_URL = "https://commons.wikimedia.org/w/api.php";

function buildSearchUrl(query) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url",
    iiurlwidth: "500",
    format: "json",
    origin: "*",
  });
  return `${API_URL}?${params.toString()}`;
}

function renderImages(pages) {
  results.replaceChildren();
  for (const page of pages) {
    const imageInfo = page.imageinfo?.[0];
    if (!imageInfo?.thumburl) continue;

    const card = document.createElement("article");
    card.className = "card";

    const image = document.createElement("img");
    image.src = imageInfo.thumburl;
    image.alt = page.title;
    image.loading = "lazy";

    const caption = document.createElement("p");
    caption.textContent = page.title;

    card.append(image, caption);
    results.appendChild(card);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = input.value.trim();
  if (!query) {
    status.textContent = "Enter a search term first.";
    input.focus();
    return;
  }

  results.replaceChildren();
  status.textContent = "Searching…";

  try {
    const response = await fetch(buildSearchUrl(query));
    if (!response.ok) throw new Error(`Request failed (${response.status})`);

    const data = await response.json();
    const pages = Object.values(data.query?.pages ?? {});
    renderImages(pages);
    status.textContent = `Showing ${results.childElementCount} results for “${query}”.`;
    if (results.childElementCount === 0) status.textContent = `No images found for “${query}”.`;
  } catch (error) {
    status.textContent = "Could not load images. Please try again.";
    console.error(error);
  }
});
