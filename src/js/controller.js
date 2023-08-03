import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;

    recipeView.renderSpinner();

    // update result view to mark selected search result
    resultsView.update(model.getSearchResultPage());

    // Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // Loading the Recipe
    await model.loadRecipe(id);

    // Rendring recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError(console.error(err));
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // 1- Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2- Get search results
    await model.loadSearchResults(query);

    // 3- Render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultPage());

    // Render the initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};
// controlSearchResults();
const controlPagination = function (goToPage) {
  // 1- Render NEW results
  resultsView.render(model.getSearchResultPage(goToPage));

  // 2- Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddbookmark = function () {
  // Add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // update recipeview
  recipeView.update(model.state.recipe);

  // render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Render spinner
    recipeView.renderSpinner();
    // Upload new recipe
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();

      // Render bookmark view
      bookmarksView.render(model.state.bookmarks);

      // Change ID in URL
      window.history.pushState(null, '', `#${model.state.recipe.id}`);
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥💥', err);
    addRecipeView.renderError(err.message);
  }
};
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerServingsUpdate(controlServings);
  recipeView.addHandlerBookmark(controlAddbookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerCLick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
