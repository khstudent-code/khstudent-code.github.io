const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Route to handle BMI data
app.post('/bmi', (req, res) => {
  // Parse the data
  const { height, weight, bmi, condition } = req.body;
  // Process the data
  const entry = {
    height: Number(height),
    weight: Number(weight),
    bmi: Number(bmi),
    date: new Date().toISOString(),
    condition: condition
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
      res.status(200).send('BMI data saved successfully!');
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


// GET needs server only, no modification of script.js
// Define a GET method
app.get('/bmi', (req, res) => {
  const weight = req.query.weight;
  const height = req.query.height;
  const bmi = weight / (height/100 * height/100)
  res.send(`Received: ${bmi}`);
});
// And then run the following query:
// http://localhost:3000/bmi?weight=80&height=180
// Try with different weight and height
// and also try to modify the method, or
// add a new GET method and try with a new query.
