import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/list';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';
/** Global state of the app
* - Search object
* - Current recipe object
* - Shopping list object
* - liked recipes
*/
const state = {};
/*
SEARCH CONTROLLER
*/

const controlSearch = async () => {
  // 1) Get query from view
  const query = searchView.getInput();
  console.log(query); //TODO

  if (query) {
    // 2) New search object and add to state
    state.search = new Search(query);

    // 3) Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    try {

      // 4) Search for recipes
      await state.search.getResults();

      // 5) Render results on UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (err) {
      alert('Something went wrong with the search...');
        clearLoader();
    }
  }
}

elements.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
});



elements.searchResPages.addEventListener('click', e => {
  const btn = e.target.closest('.btn-inline');
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});


/*
RECIPE CONTROLLER
*/


const controlRecipe = async () => {
  // Get ID from url
  const id = window.location.hash.replace('#', '');
  console.log(id);

  if (id) {
    // prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight Selected Item
    if (state.search) searchView.hightlightSelected(id);

    // Create new recipe object
    state.recipe = new Recipe(id);

    try {

      // Get recipe data and parse ingredients
      await state.recipe.getRecipe();
      console.log(state.recipe.ingredients);
      state.recipe.parseIngredients();

      // calcTime and calcServings
      state.recipe.calcTime();
      state.recipe.calcServings();

      // Render the recipe
      clearLoader();
      recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
      );
    } catch (err) {
      alert('Error processing recipe!');
    }
  }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


/*
LIST CONTROLLER
*/

const controlList = () => {
  // create a new list IF there is none yet
  if (!state.list) state.list = new List();

  // Add each ingredient to the list and UI
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
}

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;

  // Handle the delete button
  if (e.target.matches('.shopping__delete',' shopping__delete *')) {
     // delete from state
     state.list.deleteItem(id);

     // delete from ui
     listView.deleteItem(id);

     // Handle the count update
  } else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }
});

/*
LIKE CONTROLLER
*/

const controlLike = () => {
  if (!state.likes) state.likes = newLikes();

  const currentID = state.recipe.id;
  // User has NOT yet liked current recipe
  if (!state.likes.isLiked(currentID)) {
    // Add like to the state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    // toggle the like button
    likesView.toggleLikeBtn(true);

    // Add like to the UI List
    likesView.renderLike(newLike);
  // User has liked current recipe
  } else {

    // Remove like from  the state
    likesView.toggleLikeBtn(false);
    // toggle the like button

    // Remove like in the UI List
    likesView.deleteLike(currentID);

  }

  likesView.toggleLikeMenu(state.likes.getNumLikes());

};

// Restore liked recipes on page load
window.addEventListener('load', () => {
  state.likes = new Likes();

  // Restore likes
  state.likes.readStorage();

  // Toggle like menu button to appear
  likesView.toggleLikeMenu(state.likes.getNumberLikes());

  // Render the existing likes
  state.likes.likes.forEach(like => likeView.renderLike(like));
});

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    // Decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    // Decrease button is clicked
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    // Add ingredients to shopping list
    controlList();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    // Like controller
    controlLike();
  }
});




















// End of the line daddy
