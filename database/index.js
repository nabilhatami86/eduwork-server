const mongoose = require('mongoose');
const { dbHost, dbPort, dbName, dbUser, dbPass } = require('../app/config');

const dbURI = dbUser && dbPass
    ? `mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?authSource=admin`
    : `mongodb://${dbHost}:${dbPort}/${dbName}`;

mongoose
    .connect(dbURI) // Tidak perlu menambahkan opsi useNewUrlParser atau useUnifiedTopology
    .then(() => console.log("MongoDB connected successfully!"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

// Event listeners for debugging
mongoose.connection.on("connected", () => {
    console.log("Mongoose connected to DB");
});
mongoose.connection.on("error", (err) => {
    console.error("Mongoose connection error:", err);
});
mongoose.connection.on("disconnected", () => {
    console.log("Mongoose disconnected");
});

module.exports = mongoose.connection;
