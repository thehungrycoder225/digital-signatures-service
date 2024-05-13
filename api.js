const express = require('express');
const cors = require('cors');

const ds = require('./routes/ds');

// dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/ds', ds);

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Listening on port http://localhost:${port}`)
);
