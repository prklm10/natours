const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: '../../config.env' });

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

const tours = JSON.parse(
  fs.readFileSync('tours-simple.json', 'utf-8')
);

const imports = async () => {
  try {
    await Tour.create(tours);
    console.log('Data imported Successfully');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data Deleted Successfully');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  imports();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
