const mongoose = require('mongoose');

// cache the connection promise so serverless cold starts reuse one connection
// instead of opening a new one on every invocation.
let cached = null;

function connectDB() {
  if (cached) return cached;
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI missing in .env');

  mongoose.set('strictQuery', true);
  cached = mongoose.connect(uri).then((m) => {
    console.log(`mongo connected -> ${m.connection.host}/${m.connection.name}`);
    return m;
  });
  return cached;
}

module.exports = connectDB;
