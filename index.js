const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

/**
 * IMPORTANT:
 * Use DIRECT replica-set connection (NOT mongodb+srv)
 * This avoids TLS + DNS issues on Render
 */
const MONGO_URI =
  "mongodb://shivamtrivedi:Shivam123@" +
  "ac-lluptqy-shard-00-00.ltpx60z.mongodb.net:27017," +
  "ac-lluptqy-shard-00-01.ltpx60z.mongodb.net:27017," +
  "ac-lluptqy-shard-00-02.ltpx60z.mongodb.net:27017/" +
  "expense-tracker" +
  "?ssl=true&replicaSet=atlas-dj0jrf-shard-0&authSource=admin&retryWrites=true&w=majority";

// Mongo client (explicit TLS)
const client = new MongoClient(MONGO_URI, {
  tls: true,
});

let expensesCollection;

// Connect once on startup
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

// Helper: current date (dd-mm-yy)
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

/**
 * GET /transactions
 * latest → oldest
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// MongoDB connection string from Render env vars
const MONGO_URI = "mongodb+srv://shivamtrivedi:Shivam123@cluster0.ltpx60z.mongodb.net/expense-tracker?retryWrites=true&w=majority&tls=true";

// Mongo client (Atlas-safe config)
const client = new MongoClient(MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let expensesCollection;

// Connect to MongoDB once at startup
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

// Helper: current date (dd-mm-yy)
function getCurrentDate() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}-${mm}-${yy}`;
}

// POST: save transaction
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
