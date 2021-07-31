const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log(
    'Unhandled Rejection !! Server shutting down...'
  );

  process.exit(1); //1 for unhandled rejection
});

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log(
    'Uncaught Exception!! Server shutting down...'
  );

  process.exit(1); //1 for unhandled rejection
});

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
console.log(process.env.NODE_ENV);
// Schema for our collections
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(
    `Server is listening to ${port}...`
  );
});
