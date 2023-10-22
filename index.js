const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

// mongodb

const { MongoClient, ServerApiVersion } = require("mongodb");



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tb0uxuv.mongodb.net/?retryWrites=true&w=majority`;


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

    const userCollection = client.db("TravelTourDB").collection("users");
    const hotelsCollection = client.db("TravelTourDB").collection("hotels");











    // insert userinfo
    app.post("/users", async (req, res) => {
      const users = req.body;

      const query = { email: users.email };
      const existingUser = await userCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: "Already exists" });
      }

      const result = await userCollection.insertOne(users);
      res.send(result);
    });


    //Get all Hotels
        app.get("/hotels", async (req, res) => {
          const query = {};
          const cursor = hotelsCollection.find(query);
          const hotels = await cursor.toArray();
          res.send(hotels);
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
  res.send("Travel & Tour server is running");
});

app.listen(port, () => {
  console.log(`Server is running on : ${port}`);
});
