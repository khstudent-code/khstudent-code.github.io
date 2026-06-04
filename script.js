const btnEl = document.getElementById("btn");
const bmiInputEl = document.getElementById("bmi-result");
const weightConditionEl = document.getElementById("weight-condition");

function calculateBMI() {
  const heightInput = document.getElementById("height").value;
  const weightInput = document.getElementById("weight").value;

  // Validate inputs
  if (!heightInput || !weightInput) {
    alert("Please enter both height and weight.");
    return;
  }

  const height = heightInput / 100; // Convert cm to meters
  const weight = weightInput;

  const bmi = weight / (height * height);
  const bmiRounded = bmi.toFixed(2);

  bmiInputEl.value = bmiRounded;

  // Determine weight condition
  let condition = "";
  if (bmi < 18.5) {
    condition = "Under weight";
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    condition = "Normal weight";
  } else if (bmi >= 25 && bmi <= 29.9) {
    condition = "Overweight";
  } else if (bmi >= 30) {
    condition = "Obesity";
  }
  weightConditionEl.innerText = condition;

  // Send data to the server
  fetch('http://localhost:3000/bmi', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      height: heightInput,
      weight: weightInput,
      bmi: bmiRounded,
      condition: condition
    })
  })
  .then(response => response.text())
  .then(data => {
    console.log('Success:', data);
    // alert('Your BMI data has been saved!');
  })
  .catch((error) => {
    console.error('Error:', error);
    // alert('There was an error saving your data.');
  });
}

btnEl.addEventListener("click", calculateBMI);
