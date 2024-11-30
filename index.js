const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ot76b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// console.log(uri)
// console.log(process.env.DB_PASS)
// console.log(process.env.DB_USER)

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        /* ------------------------------------ coffee client ----------------------------------- */

        const database = client.db('coffeeDB');
        const coffeeCollection = database.collection('coffee');

        /* ------------------------------------ user client ----------------------------------- */
        const userCollection = client.db('userDB').collection('user');



        app.get('/coffee', async (req, res) => {
            const cursor = coffeeCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.findOne(query);
            res.send(result);
        })

        app.post('/coffee', async (req, res) => {
            const newCoffee = req.body;
            console.log('Adding new coffee', newCoffee)

            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result);
        });

        app.put('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: req.body
            }

            const result = await coffeeCollection.updateOne(filter, updatedDoc, options )

            res.send(result);
        })

        app.delete('/coffee/:id', async (req, res) => {
            console.log('going to delete', req.params.id);
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
        })







         /* ---------------------------------- user ---------------------------------- */
        //  *read
        app.get('/user',async(req,res)=>{
            const cursor = await userCollection.find().toArray();
            res.send(cursor)
        })




        //  *post 
         app.post('/user',async(req,res)=>{
            const newUser= req.body
            const result = await userCollection.insertOne(newUser);
            res.send(result)
            console.log(result)
         })


        //  *patch
        app.patch('/user',async(req,res)=>{
            const email = req.body.email;

             // create a filter for a movie to update
        const filter = { email};
         // create a document that sets the plot of the movie
        const updateDoc = {
            $set: {
                leastLoginTime: req.body.leastLoginTime
            },
        };
  const result = await userCollection.updateOne(filter, updateDoc);
           res.send(result)
           console.log(result)
         })
        //  !delete

        app.delete('/user/:id',async(req,res)=>{
            const id= req.params.id
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result)
            console.log(result)
        })

    } finally {
        // Ensures that the client will close when you finish/error
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('HOT HOT HOT COFFEEEEEEE')
})

app.listen(port, () => {
    console.log(`COffee is getting warmer in port: ${port}`);
})
