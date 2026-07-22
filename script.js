const btnEl = document.getElementById("btn");
const mixRecipeSpanEl = document.getElementById("mixRecipe");
let recipeBtnE1 = document.getElementById("recipeBtn");
let mixResultEl = document.getElementById("mix-result");
let helpBox = document.getElementById("helpBox");
mixResultEl.style.display = "none";
helpBox.style.display = "none";
let showHelpBox = true;

const helpTag = document.getElementById("helpTag");
helpTag.addEventListener("click", function(event){
  const target = event.target.closest(".clickable");

  if(target){
    const action = target.dataset.action;
    if(showHelpBox){
      document.getElementById("helpBox").style.display = "flex";
      showHelpBox = false;
    } else{
      document.getElementById("helpBox").style.display = "none";
      showHelpBox = true;
    }
    

    if(action === "showHelp"){
      document.getElementById("helpBox").innerHTML = `<p>This calculator is designed as a tool to help pastry chefs create recipes for ice cream
                                                      that will be served with the same consistency at the same temperature. It is designed to reduce
                                                      trial and error, and to be as flexible as possible in terms of the flavor component being used. It supports 
                                                      flavor that is all fat (brown butter, olive oil, etc), flavors that are partly fat and/or sugar (jams, caramels), 
                                                      as well as dark chocolate. Flavored ice creams have their flavor component take up about 20% of the mix, but this can
                                                      be higher or lower depending on how liquid the flavor component is. (ex. chocolate ice creams are usually about 15%, fruit
                                                      purees can take up about 30-40%). Tea, spice, and vanilla infusions should be formulated as an ice cream with a flavor 
                                                      component weight of 0, because they are steeped into a plain ice cream base.
                                                      <br><br>
                                                      If a recipe is possible with the parameters given, clicking "create recipe" will display the recipe below. There is also 
                                                      an option to save the recipes to a separate page. If you have specified a flavor component weight that is too high 
                                                      to make the recipe possible, the calculator will try to reduce the flavor component until a valid recipe is given (example: 
                                                      using 200g of bakers chocolate with a 1L recipe that requires 10% fat will cut back the chocolate to below 100g).
                                                      <br><br>
                                                      To have a firm but scoopable consistency in a home freezer, the ice cream should have around 
                                                      20% sugar. The sugar is adjustable from 10-25% to accomodate different serving temperatures. For
                                                      the purposes of this calculator, the final sugar percentage is not for sweetness, it controls the hardness 
                                                      of the ice cream at your serving temperature.
                                                      <br><br>
                                                      The valid range for fat is from 6-25%. this covers sherbets, gelato, ice creams, and custards. a standard home ice
                                                      cream recipe will have about 16-20% fat, while gelato will have around 8-10% fat. 
                                                      <br><br>
                                                      egg yolks emulsify and improve the texture of ice cream. a standard home recipe will use 6 egg yolks per 1 liter of mix.
                                                      <br><br>
                                                      Chocolate solids and fat requires special formulation because they both harden ice cream. By default the calculator adds
                                                      more sugar, but you can keep the same sweetness and sugar concentration by adding 80 proof alcohol like vodka, whiskey, 
                                                      bourbon etc. instead. 
                                                      </p>`;
    }
  }
});

let mixContainer = {
  totalWeight: 0,
  yolkNeed: 0,
  flavorNeed: 0.0,
  creamNeed: 0.0,
  sugarNeed: 0.0,
  milkNeed: 0.0,
  alcoholNeed: 0.0,

  percFat: 0.0,
  percSugar: 0.0
};

class Component{
  grams;
  percFat;
  percSugar;
  AFP;

  constructor(pFat, pSugar, g, afp){
    this.percFat = pFat;
    this.percSugar = pSugar;
    this.grams = g;
    this.AFP = afp;
  }

  getFat(){
    return this.percFat;
  }

  getSugar(){
    return this.percSugar;
  }

  getGrams(){
    return this.grams;
  }

  getAFP(){
    return this.AFP;
  }

  setFat(percent){
    if (percent >= 0 && percent <= 1.0){
        this.percFat = percent;
    }
    else if(percent > 1.0 && percent <= 100.0){
        this.percFat = percent/( 100.0 );
    } else {
        this.percFat = 0.0;
    }
  }

  setSugar(percent){
    if (percent >= 0 && percent <= 1.0){
        this.percSugar = percent;
    }
    else if(percent > 1.0 && percent <= 100.0){
        this.percSugar = percent/( 100.0 );
    } else {
        this.percSugar = 0.0;
    }
  }

  setGrams(weight){
    if(weight > 0){
        this.grams = weight;
    } else {
        this.grams = 0;
    }
    
    this.setAFP();
  }

  setAFP(){
    this.AFP = 0;
  }
}

class Chocolate extends Component{
  #percSolids;

  constructor(pFat, pSugar, pSolids, g, afp){
    super(pFat, pSugar, g, afp);
    this.#percSolids = pSolids;
  }

  setAFP(){
    let solidAFP = (this.#percSolids * this.grams) * 0.9;
    let fatAFP = (this.percFat * this.grams) * 1.8;

    this.AFP = solidAFP + fatAFP;
  }

  setSolids(){
    this.#percSolids = 1.0 - this.percSugar - this.percFat;
  
    //added
    this.setAFP();
  }

  setGrams(weight) {
    if(weight > 0) {
      this.grams = weight;
    } else {
      this.grams = 0;
    }
    this.setAFP();
  }

  getSolids(){
    return this.#percSolids;
  }
}

class Alcohol extends Component{
    #percAlc;

  constructor(pFat, pSugar, pAlc, g, afp){
    super(pFat, pSugar, g, afp);
    this.#percAlc = pAlc;
  }

  setAFP(){
    this.AFP = (this.#percAlc * this.grams) * 9;
  }

  setAlc(percent){
    if (percent >= 0 && percent <= 1.0){
        this.#percAlc = percent;
    }
    else if(percent > 1.0 && percent <= 100.0){
        this.#percAlc = percent/( 100.0 );
    } else {
        this.#percAlc = 0.0;
    }

    this.setAFP();
  }

  setGrams(weight) {
    if(weight > 0) {
      this.grams = weight;
    } else {
      this.grams = 0;
    }
    this.setAFP();  
  }

  getAlc() {
    return this.#percAlc;
  }
}

function solve3x3(ingMat, target, output) {
    const tolerance = 1e-9;

    // Determinant of ingMat
    const detA = ingMat[0][0] * (ingMat[1][1] * ingMat[2][2] - ingMat[1][2] * ingMat[2][1])
               - ingMat[0][1] * (ingMat[1][0] * ingMat[2][2] - ingMat[1][2] * ingMat[2][0])
               + ingMat[0][2] * (ingMat[1][0] * ingMat[2][1] - ingMat[1][1] * ingMat[2][0]);

    if (Math.abs(detA) < tolerance) return false; // singular

    // Determinant of ingMat0 (replace column 0 with target)
    const detA0 = target[0] * (ingMat[1][1] * ingMat[2][2] - ingMat[1][2] * ingMat[2][1])
                - ingMat[0][1] * (target[1] * ingMat[2][2] - ingMat[1][2] * target[2])
                + ingMat[0][2] * (target[1] * ingMat[2][1] - ingMat[1][1] * target[2]);

    // Determinant of ingMat1 (replace column 1 with target)
    const detA1 = ingMat[0][0] * (target[1] * ingMat[2][2] - ingMat[1][2] * target[2])
                - target[0] * (ingMat[1][0] * ingMat[2][2] - ingMat[1][2] * ingMat[2][0])
                + ingMat[0][2] * (ingMat[1][0] * target[2] - target[1] * ingMat[2][0]);

    // Determinant of ingMat2 (replace column 2 with target)
    const detA2 = ingMat[0][0] * (ingMat[1][1] * target[2] - target[1] * ingMat[2][1])
                - ingMat[0][1] * (ingMat[1][0] * target[2] - target[1] * ingMat[2][0])
                + target[0] * (ingMat[1][0] * ingMat[2][1] - ingMat[1][1] * ingMat[2][0]);

    output[0] = detA0 / detA;
    output[1] = detA1 / detA;
    output[2] = detA2 / detA;

    return true;
}

function solveWithZeroVariable(zeroVar,
                               originalFlavorGrams,
                               yolkGrams, yolkFat, yolkSugar,
                               vodkaGrams,
                               targetWeight, targetFatMass, targetSugarMass,
                               milkFat, milkSugar,
                               creamFat, creamSugar,
                               flavorFat, flavorSugar) {

    // Remaining weight after fixed components (yolk + vodka)
    const fixedWeight = yolkGrams + vodkaGrams;
    const W_rem = targetWeight - fixedWeight;
    const F_rem = targetFatMass - yolkGrams * yolkFat;  // vodka has 0 fat
    const S_rem = targetSugarMass - yolkGrams * yolkSugar;

    let ingMat = [[], [], []];
    const target = [W_rem, F_rem, S_rem];
    let val1, val2, newFlavorGrams;

    if (zeroVar === 0) { // cream = 0; unknowns: milk, sugar, flavor
        // x0 = milk, x1 = sugar, x2 = flavor
        ingMat[0][0] = 1;        ingMat[0][1] = 1;          ingMat[0][2] = 1;
        ingMat[1][0] = milkFat;  ingMat[1][1] = 0;          ingMat[1][2] = flavorFat;
        ingMat[2][0] = milkSugar; ingMat[2][1] = 1;         ingMat[2][2] = flavorSugar;

        let solution = [0, 0, 0];
        let success = solve3x3(ingMat, target, solution);
        if (!success) {
          return null;
        }

        val1 = solution[0]; // milk
        val2 = solution[1]; // sugar
        newFlavorGrams = solution[2];
    }
    else if (zeroVar === 1) { // milk = 0; unknowns: cream, sugar, flavor
        // x0 = cream, x1 = sugar, x2 = flavor
        ingMat[0][0] = 1;         ingMat[0][1] = 1;          ingMat[0][2] = 1;
        ingMat[1][0] = creamFat;  ingMat[1][1] = 0;          ingMat[1][2] = flavorFat;
        ingMat[2][0] = creamSugar; ingMat[2][1] = 1;         ingMat[2][2] = flavorSugar;

        let solution = [0, 0, 0];
        let success = solve3x3(ingMat, target, solution);
        if (!success) {
          return null;
        }

        val1 = solution[0]; // cream
        val2 = solution[1]; // sugar
        newFlavorGrams = solution[2];
    }
    else { // sugar = 0; unknowns: cream, milk, flavor
        // x0 = cream, x1 = milk, x2 = flavor
        ingMat[0][0] = 1;         ingMat[0][1] = 1;          ingMat[0][2] = 1;
        ingMat[1][0] = creamFat;  ingMat[1][1] = milkFat;    ingMat[1][2] = flavorFat;
        ingMat[2][0] = creamSugar; ingMat[2][1] = milkSugar; ingMat[2][2] = flavorSugar;

        let solution = [0, 0, 0];
        let success = solve3x3(ingMat, target, solution);
        if (!success) {
          return null;
        }

        val1 = solution[0]; // cream
        val2 = solution[1]; // milk
        newFlavorGrams = solution[2];
    }

    // Check feasibility: all amounts >= 0, and new flavor weight <= original
    const TOL = 1e-9;
    if (newFlavorGrams < -TOL || newFlavorGrams > originalFlavorGrams + TOL) {
        return null;
    }
    if (val1 < -TOL || val2 < -TOL) {
        return null;
    }
    // allow small negative values to be clamped to zero
    if (val1 < 0) val1 = 0;
    if (val2 < 0) val2 = 0;
    if (newFlavorGrams < 0) newFlavorGrams = 0;

    return { newFlavorGrams, val1, val2 };
}

function makeMix(ingWeight, ingPercFat, ingPercSugar,
                mixWeight, mixPercFat, mixPercSugar,
                isChocolate, useAlcohol, mixPercYolk){

  let solveableMatrix;

  let milkNeed = 0;
  let creamNeed = 0;
  let sugarNeed = 0;
  let yolkWeight = mixWeight * mixPercYolk;
        
  const Milk03 = new Component(0.0325, 0.0526, 0, 0);
  const Cream37 = new Component(0.37, 0.01, 0, 0);
  const Sugar = new Component(0, 1.0, 0, 0);
  const Yolk = new Component(0.2654, 0.0056, yolkWeight, 0);
  const Vodka = new Alcohol(0,0, 0.4, 0, 0);
  const FinalMix = new Component(0,0,0,0);
  let Flavor;

  if (isChocolate) {
    Flavor = new Chocolate(0,0,0,0,0);
  } else {
    Flavor = new Component(0,0,0,0);
  }

  Flavor.setSugar(ingPercSugar);
  Flavor.setFat(ingPercFat);
  Flavor.setSolids?.(); // ?. will only call if method exists
  Flavor.setGrams(ingWeight);

  if(useAlcohol){
    Vodka.setGrams(Flavor.getAFP()/(Vodka.getAlc()*9));
  }

  FinalMix.setSugar(mixPercSugar);
  FinalMix.setFat(mixPercFat);
  FinalMix.setGrams(mixWeight);

  let totalWeight = Flavor.getGrams() + Yolk.getGrams() + Vodka.getGrams(); //these are set from beginning
  let totalFat = (Flavor.getFat() * Flavor.getGrams() + Milk03.getFat() * Milk03.getGrams() + Cream37.getFat() * Cream37.getGrams() + Yolk.getFat() * Yolk.getGrams() ) / totalWeight;
  let totalSugar = (Flavor.getSugar() * Flavor.getGrams() + Milk03.getSugar() * Milk03.getGrams() + Cream37.getSugar() * Cream37.getGrams() + Yolk.getSugar() * Yolk.getGrams() + Sugar.getGrams() ) / totalWeight;

  let fatFixed = Flavor.getGrams() * Flavor.getFat() + Yolk.getGrams() * Yolk.getFat();
  let sugarFixed = Flavor.getGrams() * Flavor.getSugar() + Yolk.getGrams() * Yolk.getSugar() - Flavor.getAFP() + Vodka.getGrams() * (Vodka.getAlc() * 9);
  let fatTarget = FinalMix.getGrams() * FinalMix.getFat();
  let sugarTarget = FinalMix.getGrams() * FinalMix.getSugar();

  let fatNeeded = fatTarget - fatFixed;
  let sugarNeeded = sugarTarget - sugarFixed;
  let weightNeeded = FinalMix.getGrams() - Flavor.getGrams() - Yolk.getGrams() - Vodka.getGrams();

  let ingredientRatios = [[1,1,1],
                      [Cream37.getFat(), Milk03.getFat(), Sugar.getFat()],
                      [Cream37.getSugar(), Milk03.getSugar(), Sugar.getSugar()]];

  let neededTargets = [weightNeeded, fatNeeded, sugarNeeded];
  let outputIngredients = [0,0,0];

  solveableMatrix = solve3x3(ingredientRatios, neededTargets, outputIngredients);

  if(solveableMatrix && outputIngredients[0] >= 0 && outputIngredients[1] >= 0 && outputIngredients[2] >= 0){
    creamNeed = outputIngredients[0];
    milkNeed = outputIngredients[1];
    sugarNeed = outputIngredients[2];

    totalWeight += milkNeed + creamNeed + sugarNeed;

    let totalFatMass = milkNeed * Milk03.getFat()
                    + creamNeed * Cream37.getFat()
                    + Yolk.getGrams() * Yolk.getFat()
                    + Flavor.getGrams() * Flavor.getFat()
                    + Vodka.getGrams() * Vodka.getFat();

    let totalSugarMass = milkNeed * Milk03.getSugar()
                    + creamNeed * Cream37.getSugar()
                    + Yolk.getGrams() * Yolk.getSugar()
                    + sugarNeed  // pure sugar contributes its full mass
                    + Flavor.getGrams() * Flavor.getSugar()
                    + Vodka.getGrams() * Vodka.getSugar();

    mixContainer.totalWeight = totalWeight;
    mixContainer.creamNeed = creamNeed;
    mixContainer.milkNeed = milkNeed;
    mixContainer.sugarNeed = sugarNeed;
    mixContainer.yolkNeed = Yolk.getGrams();
    mixContainer.flavorNeed = Flavor.getGrams();
    mixContainer.alcoholNeed = Vodka.getGrams();

    mixContainer.percFat = (totalFatMass / totalWeight) * 100.0;
    mixContainer.percSugar = (totalSugarMass / totalWeight) * 100.0;

  } else {
    let newFlavor = 0;
    let a = 0;
    let b = 0;
    let feasible = false;
    let bestCase = -1;
    let bestFlavor = -1;

    //try cream = 0 first, then milk =0, then sugar = 0
    for(let zeroVar = 0; zeroVar < 3; zeroVar++){
      const result = solveWithZeroVariable(zeroVar, Flavor.getGrams(),
                              Yolk.getGrams(), Yolk.getFat(), Yolk.getSugar(),
                              Vodka.getGrams(),
                              FinalMix.getGrams(),
                              fatTarget, sugarTarget,
                              Milk03.getFat(), Milk03.getSugar(),
                              Cream37.getFat(), Cream37.getSugar(),
                              Flavor.getFat(), Flavor.getSugar());
        
        //accept if flavor reduction works, aka is >= 0
        if(result && result.newFlavorGrams >= 0 && result.newFlavorGrams <= Flavor.getGrams()){
          feasible = true;
          bestCase = zeroVar;
          bestFlavor = result.newFlavorGrams;

          a = result.val1;
          b = result.val2;

          break; //take first feasible reduction
        }
    }

    if(feasible){
      //update flav weight
      Flavor.setGrams(bestFlavor);

      if(bestCase === 0){ //cream 0
        creamNeed = 0;
        milkNeed = a;
        sugarNeed = b;
      } else if (bestCase === 1) { // milk 0
        creamNeed = a;
        milkNeed = 0;
        sugarNeed = b;
      } else { // sugar 0
        creamNeed = a;
        milkNeed = b;
        sugarNeed = 0;
      }

      totalWeight += milkNeed + creamNeed + sugarNeed;

      let totalFatMass = milkNeed * Milk03.getFat()
                        + creamNeed * Cream37.getFat()
                        + Yolk.getGrams() * Yolk.getFat()
                        + Flavor.getGrams() * Flavor.getFat()
                        + Vodka.getGrams() * Vodka.getFat();

      let totalSugarMass = milkNeed * Milk03.getSugar()
                        + creamNeed * Cream37.getSugar()
                        + Yolk.getGrams() * Yolk.getSugar()
                        + sugarNeed  // pure sugar contributes its full mass
                        + Flavor.getGrams() * Flavor.getSugar()
                        + Vodka.getGrams() * Vodka.getSugar();

    mixContainer.totalWeight = totalWeight;
    mixContainer.creamNeed = creamNeed;
    mixContainer.milkNeed = milkNeed;
    mixContainer.sugarNeed = sugarNeed;
    mixContainer.yolkNeed = Yolk.getGrams();
    mixContainer.flavorNeed = Flavor.getGrams();
    mixContainer.alcoholNeed = Vodka.getGrams();

    mixContainer.percFat = (totalFatMass / totalWeight) * 100.0;
    mixContainer.percSugar = (totalSugarMass / totalWeight) * 100.0;

    } 

  }
}

function calculateRecipe() {
  const ingNameInput = document.getElementById("ingName").value;
  const ingWeightInput = parseFloat(document.getElementById("ingWeight").value);
  const ingFatInput = parseFloat(document.getElementById("ingPercFat").value);
  const ingSugarInput = parseFloat(document.getElementById("ingPercSugar").value);
  const isChocInput = document.getElementById("isChocolate").checked;

  const mixWeightInput = parseFloat(document.getElementById("mixWeight").value);
  const mixFatInput = parseFloat(document.getElementById("mixPercFat").value);
  const mixSugarInput = parseFloat(document.getElementById("mixPercSugar").value);
  const mixYolkInput = parseFloat(document.getElementById("mixPercYolk").value);
  const useAlcoholInput = document.getElementById("useAlcohol").checked;
  const saveRecipe = document.getElementById("saveRecipe").checked;

  // Validate inputs
  if(isNaN(ingWeightInput) || isNaN(ingFatInput) || isNaN(ingSugarInput) || isNaN(mixWeightInput) || isNaN(mixFatInput) || isNaN(mixSugarInput) || isNaN(mixYolkInput)){
    alert("Enter valid inputs.");
    return;
  }

  if(ingFatInput + ingSugarInput > 100){
    alert("Enter valid percentages for the ingredient.")
    return;
  }
  
  if(mixFatInput + mixSugarInput > 100){
    alert("Enter valid percentages for the final mix.")
    return;
  }

  if (mixWeightInput <= ingWeightInput) {
    alert("Please enter valid weights. final mix must weigh more than flavor weight.");
    return;
  }

  let ingWeight = 0;
  let ingPercFat = 0.0;
  let ingPercSugar = 0.0;
  let isChocolate = isChocInput;

  let mixWeight = 0;
  let mixPercFat = 0.0;
  let mixPercSugar = 0.0;
  let mixPercYolk = 0.0;
  let useAlcohol = useAlcoholInput;

  ingWeight = ingWeightInput;
  if(isChocolate){
    ingPercFat = ((100 - ingSugarInput)/2)/100;
    ingPercSugar = ingSugarInput/100;
  } else{
    ingPercFat = ingFatInput/100;
    ingPercSugar = ingSugarInput/100;
  }
  
  
  mixWeight = mixWeightInput;
  mixPercFat = mixFatInput/100;
  mixPercSugar = mixSugarInput/100;
  mixPercYolk = mixYolkInput*17/1000;

  makeMix(ingWeight, ingPercFat, ingPercSugar, mixWeight, mixPercFat, mixPercSugar, isChocolate, useAlcohol, mixPercYolk);

  const totalWeightDisp = mixContainer.totalWeight.toFixed(0);
  const creamNeedDisp = mixContainer.creamNeed.toFixed(0);
  const milkNeedDisp = mixContainer.milkNeed.toFixed(0);
  const sugarNeedDisp = mixContainer.sugarNeed.toFixed(0);
  const yolkNeedDisp = mixContainer.yolkNeed.toFixed(0);
  const flavorNeedDisp = mixContainer.flavorNeed.toFixed(0);
  const alcoholNeedDisp = mixContainer.alcoholNeed.toFixed(0);

  const PercFatDisp = mixContainer.percFat.toFixed(1);
  const PercSugarDisp = mixContainer.percSugar.toFixed(1);

  mixResultEl.style.display = "flex"; //make mix stats visible

  const mixPercs = "The mix is "+ String(totalWeightDisp) + "g, with " + String(PercFatDisp) + "% fat and " + String(PercSugarDisp) + "% sugar."
  mixResultEl.value = mixPercs;

  let recipeText =  (!(ingNameInput === "") ? ingNameInput : "Untitled") + " ice cream recipe:\n\n" +
                    (creamNeedDisp > 0 ? "Cream: " + creamNeedDisp + "g\n" : "") +
                    (milkNeedDisp > 0 ? "Whole Milk: " + milkNeedDisp + "g\n" : "") +
                    (sugarNeedDisp > 0 ? "Sugar: " + sugarNeedDisp + "g\n" : "") +
                    (yolkNeedDisp > 0 ? "Egg Yolks: " + yolkNeedDisp + "g\n" : "") +
                    (flavorNeedDisp > 0 ? "Flavor Component: " + flavorNeedDisp + "g\n" : "") +
                    (alcoholNeedDisp > 0 ? "80 proof Alcohol: " + alcoholNeedDisp + "g\n" : "");
  
  mixRecipeSpanEl.innerText = recipeText;

  // Send data to the server

  if(saveRecipe){
    fetch('http://localhost:3000/recipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ingName: ingNameInput,
        mixWeight: totalWeightDisp,
        mixFat: PercFatDisp,
        mixSugar: PercSugarDisp,

        cream: creamNeedDisp,
        milk: milkNeedDisp,
        sugar: sugarNeedDisp,
        yolk: yolkNeedDisp,
        flavor: flavorNeedDisp,
        alcohol: alcoholNeedDisp
      })
    })
    .then(response => response.text())
    .then(data => {
      console.log('Success:', data);
      alert('Your recipe has been saved!');
    })
    .catch((error) => {
      console.error('Error:', error);
       alert('There was an error saving your data.');
    });
  }
  
}

btnEl.addEventListener("click", calculateRecipe);
