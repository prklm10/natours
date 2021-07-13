const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });
// First read env variable then call app

const app = require('./app');
// DB url with password
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
// connect to our DB
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(
      'DB Connection successfully established'
    );
  });

// Schema for our collections
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(
    `Server is listening to ${port}...`
  );
});
