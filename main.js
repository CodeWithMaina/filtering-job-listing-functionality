let listingContainer = document.getElementById("listing-container");
let listingData = [];

const filterContainer = document.querySelector(".filter-container");
let activeTags = [];

// Fetching Listings
async function fetchListings() {
  try {
    const response = await fetch("data.json");
    if (!response.ok) throw new Error("Failed to fetch data.json");
    listingData = await response.json();
    console.log(listingData);
    renderJobListing();
  } catch (err) {
    console.error("Error loading job listings:", err);
    listingContainer.innerHTML = "<p>Error loading job listings.</p>";
  }
}

// Render All Listings
function renderJobListing() {
  listingContainer.innerHTML = "";

  listingData.forEach((listing) => {
    const div = createListingCard(listing);
    listingContainer.appendChild(div);
  });
}

// Create a single job listing DOM node
function createListingCard(listing) {
  const div = document.createElement("div");
  div.classList.add("job-card");
  if (listing.featured) div.classList.add("featured");

  const tags = [...[listing.role, listing.level], ...listing.languages, ...listing.tools];

  div.innerHTML = `
    <div class="job-header">
      <img src="${listing.logo}" alt="${listing.company} logo" class="company-logo">
      <div class="job-info">
        <div class="company-meta">
          <span class="company-name">${listing.company}</span>
          ${listing.new ? '<span class="tag new">NEW!</span>' : ""}
          ${listing.featured ? '<span class="tag featured">FEATURED</span>' : ""}
        </div>
        <h2 class="position">${listing.position}</h2>
        <ul class="job-meta">
          <li>${listing.postedAt}</li>
          <li>${listing.contract}</li>
          <li>${listing.location}</li>
        </ul>
      </div>
    </div>
    <div class="job-tags">
      ${tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
    </div>
  `;
  return div;
}

// filtering functionality setup
// Creating elements
const filterToggleBtn = document.createElement("button");
filterToggleBtn.textContent = "Toggle Filter";
filterToggleBtn.classList.add("filter-toggle-btn");

const filterBox = document.createElement("div");
filterBox.classList.add("filter-box");
filterBox.style.display = "none";

const input = document.createElement("input");
input.type = "text";
input.placeholder = "Type tag and press Enter";
input.classList.add("filter-input");

const tagsContainer = document.createElement("div");
tagsContainer.classList.add("tags-container");

const clearBtn = document.createElement("button");
clearBtn.textContent = "Clear";
clearBtn.classList.add("clear-btn");

filterBox.appendChild(input);
filterBox.appendChild(tagsContainer);
filterBox.appendChild(clearBtn);
filterContainer.appendChild(filterToggleBtn);
filterContainer.appendChild(filterBox);

// Toggle filter visibility
filterToggleBtn.addEventListener("click", () => {
  filterBox.style.display = filterBox.style.display === "none" ? "block" : "none";
});

// Add tag on Enter
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const tag = input.value.trim();
    if (tag && !activeTags.includes(tag)) {
      activeTags.push(tag);
      renderTags();
      filterListings();
    }
    input.value = "";
  }
});

// Clear tags and reset listings
clearBtn.addEventListener("click", () => {
  activeTags = [];
  renderTags();
  renderJobListing();
});

// Render current tags with remove buttons
function renderTags() {
  tagsContainer.innerHTML = "";
  activeTags.forEach((tag) => {
    const span = document.createElement("span");
    span.className = "filter-tag";
    span.textContent = tag;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.className = "remove-tag-btn";
    removeBtn.addEventListener("click", () => {
      activeTags = activeTags.filter(t => t !== tag);
      renderTags();
      filterListings();
    });

    span.appendChild(removeBtn);
    tagsContainer.appendChild(span);
  });
}

// Filter listings based on all active tags searching through all relevant listing fields
function filterListings() {
  listingContainer.innerHTML = "";

  const filtered = listingData.filter((listing) => {
    const searchableFields = [
      listing.company,
      listing.position,
      listing.role,
      listing.level,
      listing.postedAt,
      listing.contract,
      listing.location,
      ...listing.languages,
      ...listing.tools
    ].map(field => field.toLowerCase());

    // For each active tag, check if it is found in ANY of the searchable fields
    return activeTags.every(tag => {
      const lowerTag = tag.toLowerCase();
      return searchableFields.some(field => field.includes(lowerTag));
    });
  });

  if (filtered.length === 0) {
    listingContainer.innerHTML = "<p>No job listings match the selected tags.</p>";
    return;
  }

  filtered.forEach((listing) => {
    const div = createListingCard(listing);
    listingContainer.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", fetchListings);
