async function loadRecipes(){
    try {
        const response = await fetch('http://localhost:3000/recipe');
        const recipes = await response.json();
        const container = document.getElementById('recipeContainer');

        if(recipes.length === 0){
            container.innerHTML = '<p>No saved recipes.</p>';
            return;
        }

        container.innerHTML = '';

        //display new first
        recipes.forEach((recipe, index) => {
            //create a new recipe card for each recipe in data.json
            const rCard = document.createElement('div');
            rCard.className = 'recipeCard';
            rCard.style.display = 'block';

            rCard.innerHTML = createRecipeHTML(recipe, index);

            container.appendChild(rCard);
        });
    } catch (anError) {
        console.error('Error loading recipes: ', anError);
        document.getElementById('recipesContainer').innerHTML = '<p style="errorMsg"> Error loading recipes.</p>';

    }
}

function createRecipeHTML(recipe, index){
    const baseHTML = `<h3>Recipe #${index + 1}: ${recipe.ingName}</h3>
            <p><strong>saved on </strong>${new Date(recipe.date).toLocaleString()}</p>
            <p>Mix weight: <strong>${recipe.mixWeight}g</strong></p
            <p>Mix percent fat: <strong>${recipe.mixFat}%</strong></p>
            <p>Mix percent sugar: <strong>${recipe.mixSugar}%</strong></p>
            <hr>`;

        const optionalFields = [
            {key: "cream", label: "Cream"},
            {key: "milk", label: "Whole Milk"},
            {key: "sugar", label: "Sugar"},
            {key: "yolk", label: "Egg Yolk"},
            {key: "flavor", label: "Flavor"},
            {key: "alcohol", label: "80 Proof Alcohol"}
        ];

        const optionalHTML = optionalFields.filter(field => recipe[field.key] > 0) //if component is <= 0, filter it out
                            .map(field => `<p>${field.label}: <strong>${recipe[field.key]}g</strong></p>`) //for each nonfiltered component, add to optionalHTML
                            .join("");

        return baseHTML + optionalHTML;
}

loadRecipes();
document.getElementById('refreshBtn').addEventListener('click', loadRecipes);