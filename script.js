// Populate the area dropdown when the page loads
window.addEventListener("DOMContentLoaded", function () {
  const areaSelect = document.getElementById("area-select");
  areaSelect.innerHTML = '<option value="">Select Area</option>';

  fetch("https://www.themealdb.com/api/json/v1/1/list.php?a=list")
    .then((response) => response.json())
    .then((data) => {
      if (data.meals) {
        data.meals.forEach((areaObj) => {
          const option = document.createElement("option");
          option.value = areaObj.strArea;
          option.textContent = areaObj.strArea;
          areaSelect.appendChild(option);
        });
      }
    });
});

// When the user selects an area, fetch and display meals for that area
document.getElementById("area-select").addEventListener("change", function () {
  const area = this.value;
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = ""; // Clear previous results

  if (!area) return;

  fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(
      area
    )}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.meals) {
        data.meals.forEach((meal) => {
          const mealDiv = document.createElement("div");
          mealDiv.className = "meal";
          // store the meal id so we can lookup details when clicked
          mealDiv.dataset.id = meal.idMeal;
          // make it keyboard-focusable and accessible
          mealDiv.tabIndex = 0;
          mealDiv.setAttribute("role", "button");
          mealDiv.setAttribute("aria-label", `${meal.strMeal} recipe`);
          // give a visual affordance that this is clickable
          mealDiv.style.cursor = "pointer";

          const title = document.createElement("h3");
          title.textContent = meal.strMeal;

          const img = document.createElement("img");
          img.src = meal.strMealThumb;
          img.alt = meal.strMeal;

          mealDiv.appendChild(title);
          mealDiv.appendChild(img);
          resultsDiv.appendChild(mealDiv);
        });
      } else {
        resultsDiv.textContent = "No meals found for this area.";
      }
    });
});

// When user selects a meal, fetch and display full meal details

// Use event delegation on the results container so clicks on any .meal
// element will fetch and display the full recipe details.
document.getElementById("results").addEventListener("click", (event) => {
  const mealEl = event.target.closest(".meal");
  if (!mealEl) return; // click wasn't on a meal

  const mealId = mealEl.dataset.id;
  if (!mealId) return;

  const recipesDiv = document.getElementById("recipes");

  // If the clicked meal is already open, toggle it closed
  if (recipesDiv.dataset.openMeal === mealId) {
    recipesDiv.innerHTML = "";
    delete recipesDiv.dataset.openMeal;
    return;
  }

  // Otherwise clear previous recipe and mark this meal as open
  recipesDiv.innerHTML = "";
  recipesDiv.dataset.openMeal = mealId;

  // lookup endpoint requires the full https:// URL
  fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(
      mealId
    )}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.meals) {
        const meal = data.meals[0];
        const recipe = document.createElement("div");
        recipe.className = "recipe";

        const title = document.createElement("h3");
        title.textContent = meal.strMeal;

        const img = document.createElement("img");
        img.src = meal.strMealThumb;
        img.alt = meal.strMeal;

        const instructions = document.createElement("p");
        instructions.textContent = meal.strInstructions;

        recipe.appendChild(title);
        recipe.appendChild(img);
        recipe.appendChild(instructions);
        recipesDiv.appendChild(recipe);
      } else {
        recipesDiv.textContent = "No recipe found for this meal.";
        delete recipesDiv.dataset.openMeal;
      }
    })
    .catch((err) => {
      console.error("Error fetching meal details:", err);
      recipesDiv.textContent = "Error loading recipe.";
      delete recipesDiv.dataset.openMeal;
    });
});
