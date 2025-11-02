const express = require('express');
require('dotenv').config()

const app = express();
app.use(express.json());

const PORT = process.env.SERVER_PORT;

app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

app.listen(PORT, () => {
  console.log(`✅Server is running on http://localhost:${PORT}`);
});