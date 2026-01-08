const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;




const { MongoClient, ServerApiVersion } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectDB() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
}

connectDB();


let expensesCollection;

// connect once when server starts
async function connectDB() {
  await client.connect();
  const db = client.db("expense-tracker");
  expensesCollection = db.collection("expenses");
  console.log("MongoDB connected");
}

connectDB().catch(console.error);

// helper to format date dd-mm-yy
function getCurrentDate() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}-${mm}-${yy}`;
}

/**
 * POST /transactions
 * body: { amount, name, category? }
 */
app.post("/transactions", async (req, res) => {
  try {
    const { amount, name, category } = req.body;

    if (!amount || !name) {
      return res.status(400).json({
        error: "amount and name are required"
      });
    }

    const transaction = {
      amount: Number(amount),
      name,
      category: category || "others",
      date: getCurrentDate(),
      createdAt: new Date()
    };

    const result = await expensesCollection.insertOne(transaction);

    res.status(201).json({
      message: "Transaction saved",
      id: result.insertedId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /transactions
 * returns latest → oldest
 */
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
