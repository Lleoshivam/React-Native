const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

/**
 * Direct replica-set MongoDB connection (Render-safe)
 */
const MONGO_URI =
  "mongodb://shivamtrivedi:Shivam123@" +
  "ac-lluptqy-shard-00-00.ltpx60z.mongodb.net:27017," +
  "ac-lluptqy-shard-00-01.ltpx60z.mongodb.net:27017," +
  "ac-lluptqy-shard-00-02.ltpx60z.mongodb.net:27017/" +
  "expense-tracker" +
  "?ssl=true&replicaSet=atlas-dj0jrf-shard-0&authSource=admin&retryWrites=true&w=majority";

const client = new MongoClient(MONGO_URI, { tls: true });

let expensesCollection;

// Connect to MongoDB once
async function connectDB() {
  try {
    await client.connect();
    const db = client.db("expense-tracker");
    expensesCollection = db.collection("expenses");
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
}

connectDB();

// Format date: dd-mm-yy
function getCurrentDate() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}-${mm}-${yy}`;
}

// POST: create transaction
app.post("/transactions", async (req, res) => {
  try {
    const { amount, name, category } = req.body;

    if (!amount || !name) {
      return res.status(400).json({
        error: "amount and name are required",
      });
    }

    const transaction = {
      amount: Number(amount),
      name,
      category: category || "others",
      date: getCurrentDate(),
      createdAt: new Date(),
    };

    const result = await expensesCollection.insertOne(transaction);

    res.status(201).json({
      message: "Transaction saved",
      id: result.insertedId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: latest → oldest
app.get("/transactions", async (req, res) => {
  try {
    const transactions = await expensesCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
