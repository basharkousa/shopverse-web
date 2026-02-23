require("dotenv").config(); // loads .env FIRST
const app = require("./app"); // app imports db.js after env is ready

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});