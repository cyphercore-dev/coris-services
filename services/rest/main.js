const API_PORT = 3000;

const express = require('express');
const cors = require('cors')
const Redis = require("ioredis");

let app = express();
app.use(cors());

let redis = new Redis();

app.get('/api/validators', (req, res) => { 
  redis.get('validators')
  .then(validators => {
    res.json(JSON.parse(validators));
  })
  .catch(e => res.status(404).json({ error: "db error" }))
});

app.listen(API_PORT, () => console.log(`Rest is listening on port ${API_PORT}!`));