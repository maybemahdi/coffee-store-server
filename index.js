const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nrdgddr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const coffeeCollection = client.db("coffeeDB").collection("coffees");
    const userCollection = client.db("coffeeDB").collection("users");

    // get
    app.get("/coffees", async (req, res) => {
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const coffee = await coffeeCollection.findOne(query);
      res.send(coffee);
    });
    //create
    app.post("/coffees", async (req, res) => {
      const coffee = req.body;
      console.log(coffee);
      const result = await coffeeCollection.insertOne(coffee);
      res.send(result);
    });

    // delete
    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    // put / update
    app.put("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const coffee = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateCoffee = {
        $set: {
          name: coffee.name,
          chef: coffee.chef,
          supplier: coffee.supplier,
          taste: coffee.taste,
          category: coffee.category,
          details: coffee.details,
          photo: coffee.photo,
        },
      };
      const result = await coffeeCollection.updateOne(
        filter,
        updateCoffee,
        options
      );
      res.send(result);
    });

    // CRUD for users db;
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const user = await userCollection.findOne(query);
      res.send(user);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateUser = {
        $set: {
          lastLoggedAt: user.lastLoggedAt,
        },
      };
      const result = await userCollection.updateOne(
        filter,
        updateUser,
        options
      );
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Coffee maker app is running");
});

app.listen(port, () => {
  console.log(`Coffee server is running on port ${port}`);
});
