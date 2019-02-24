const mongoose = require('mongoose');

exports.dbConnection = app => {
  mongoose.connect(
    'mongodb+srv://shahrour:UXAlOi5HjrRAkdqo@cluster0-7xidj.mongodb.net/zealius_test?retryWrites=true',
    { useCreateIndex: true, useNewUrlParser: true }
  );

  const db = mongoose.connection;

  db.on('connected', () => {
    console.log('MongoDB connected!');
    app.listen(80, 'localhost');
  });
  db.on('error', err => {
    console.log('Mongoose connection error: ' + err);
    process.exit(1);
  });
  db.on('disconnected', function() {
    console.log('Mongoose disconnected');
  });
  process.on('SIGINT', () => {
    db.close(() => {
      console.log('Mongoose connection disconnected through app termination');
      process.exit(0);
    });
  });
};
