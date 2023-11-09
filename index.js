const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());


//verify jWT

 
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send("Unauthorized");
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send("Forbidden");
        }
        req.decoded = decoded;
        next();
    });
}



// mongodb

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");



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
    const ordersCollection = client.db("TravelTourDB").collection("orders");
   


    const verifyAdmin = async (req, res, next) => {
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({
          email: requester,
      });
      if (requesterAccount.role === "admin") {
          next();
      } else {
          res.status(403).send("Forbidden");
      }
  };

  //make an admin api
  app.put(
      "/user/admin/:email",
      // verifyJWT,
      // verifyAdmin,
      async (req, res) => {
          const email = req.params.email;
          const filter = { email: email };
          const updateDoc = {
              $set: { role: "admin" },
          };
          const result = await userCollection.updateOne(
              filter,
              updateDoc
          );
          res.send(result);
      }
  );


  //make an host
  app.put(
      "/user/host/:email",
      // verifyJWT,
      // verifyAdmin,
      async (req, res) => {
          const email = req.params.email;
          const filter = { email: email };
          const updateDoc = {
              $set: { role: "host" },
          };
          const result = await userCollection.updateOne(
              filter,
              updateDoc
          );
          res.send(result);
      }
  );



  app.get("/admin/:email", async (req, res) => {
    const email = req.params.email;
    const user = await userCollection.findOne({ email: email });
    const isAdmin = user.role === "admin";
    res.send({ admin: isAdmin });
});

  app.get("/host/:email", async (req, res) => {
    const email = req.params.email;
    const user = await userCollection.findOne({ email: email });
    const isHost = user.role === "host";
    res.send({ host: isHost });
});



app.put("/user/:email", async (req, res) => {
    const email = req.params.email;
    const user = req.body;
    const filter = { email: email };
    const options = { upsert: true };
    const updateDoc = {
        $set: user,
    };
    const result = await userCollection.updateOne(
        filter,
        updateDoc,
        options
    );
    const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
    );
    res.send({ result, token });
});

app.get("/user", async (req, res) => {
    const users = await userCollection.find({}).toArray();
    res.send(users);
});






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


    
      //post user

      app.put("/user/:email", async (req, res) => {
        const email = req.params.email;
        const user = req.body;
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
            $set: user,
        };
        const result = await userCollection.updateOne(
            filter,
            updateDoc,
            options
        );
        const token = jwt.sign(
            { email: email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" }
        );
        res.send({ result, token });
    });

    


    //Get all Hotels
        app.get("/hotels", async (req, res) => {
          const query = {};
          const cursor = hotelsCollection.find(query);
          const hotels = await cursor.toArray();
          res.send(hotels);
      });

          // get hotel by id
          app.get("/hotels/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const hotel = await hotelsCollection.findOne(query);
            res.send(hotel);
        });


    //post an Hotel
    app.post('/hotels', async(req , res) => {
      const newItem = req.body;
      const result = await hotelsCollection.insertOne(newItem);

      res.send(result);
    });


        // post new order
        app.post("/orders", async (req, res) => {
          const order = req.body;
          const result = await ordersCollection.insertOne(order);
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
  res.send("Travel & Tour server is running");
});

app.listen(port, () => {
  console.log(`Server is running on : ${port}`);
});
