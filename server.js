/*
How to set up server:

-open cmd
-dir/cd to webpage directory

install dependencies if needed:
npm init -y
npm install express body-parser fs cors

create empty data file:
echo [] > data.json

start server:
node.js
"C:\Program Files\nodejs\node.exe" server.js

keep running while using web application

use ctrl c to end server running
*/ 


const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Route to handle recipe data
app.post('/recipe', (req, res) => {
  // Parse the recipe data
  const { ingName, mixWeight, mixFat, mixSugar, cream, milk, sugar, yolk, flavor, alcohol } = req.body;
  // Process the data
  const entry = {
    ingName: String(ingName),
    mixWeight: Number(mixWeight),
    mixFat: Number(mixFat),
    mixSugar: Number(mixSugar),
    cream: Number(cream),
    milk: Number(milk),
    sugar: Number(sugar),
    yolk: Number(yolk),
    flavor: Number(flavor),
    alcohol: Number(alcohol),
    date: new Date().toISOString()
  };

  // Read existing data
  fs.readFile('data.json', (err, data) => {
    let json = [];
    if (!err && data.length > 0) {
      json = JSON.parse(data);
    }

    // Add new entry
    json.push(entry);

    // Write updated data back to file
    fs.writeFile('data.json', JSON.stringify(json, null, 2), (err) => {
      if (err) {
        console.error('Error writing to data.json:', err);
        return res.status(500).send('Internal Server Error');
      }
      res.status(200).send('Recipe data saved successfully!');
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


// GET needs server only, no modification of script.js
// Define a GET method
app.get('/recipe', (req, res) => {
  fs.readFile('data.json', (err, data) => {
    if (err) {
      return res.status(500).send("Error reading");
    }
    const recipes = JSON.parse(data);
    res.json(recipes);
  });
});
// And then run the following query:
// http://localhost:3000/bmi?weight=80&height=180