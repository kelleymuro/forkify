// Global app controller
import axios from 'axios';

async function getResults(query) {
  const key = '3f070dc8c31f57e4ec74a471b1452f6f';
  try {
    const res = await axios(`https://www.food2fork.com/api/search?key=${key}&q=${query}`);
    const recipes = res.data.recipes;
    console.log(recipes);
  } catch (error) {
    alert(error);
  }

}
getResults('tomato pasta');
