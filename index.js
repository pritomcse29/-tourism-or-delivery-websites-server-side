const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const port = process.env.PORT || 5000;
//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0sln2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);
async function run() {

    try {
        await client.connect();
        // console.log('database connceted');
        const database = client.db('Sarkarfood');
        const foodsCollection = database.collection('foods');
        const orderCollection = database.collection('orders');
        const usersCollection = database.collection("users");
        //GET Foods API

        app.get('/foods', async (req, res) => {
            const cursor = foodsCollection.find({});
            const foods = await cursor.toArray();
            res.send(foods);
        });


        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const users = await cursor.toArray();
            res.send(users);
        }
        );

        app.get('/users/:id', async (req, res) => {
            const id = req.params.id
                ;
            const query = { _id: ObjectId(id) };

            const user = await usersCollection.findOne(query);
            // console.log('load user with id:', id);
            res.send(user);
        })

        //Use POST 
        app.post('/foods/bykeys', async (req, res) => {
            const keys = req.body;
            const query = { key: { $in: keys } }
            const foods = await foodsCollection.find(query).toArray();

            res.json(foods);
        });

        //Add orders API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            // console.log('order', order);
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })





        // POST API

        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await usersCollection.insertOne(newUser)
            console.log('hitting the post', req.body);
            console.log('added user', result);
            res.json(result);
        });


        //UPDATE API
        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    address: updatedUser.address,
                    name: updatedUser.name,
                    email: updatedUser.email
                },

            };
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            console.log('updating user', req)
            res.json(result);
        })

        //DELETE API

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);

            console.log('deleting user with id', result);
            res.json(result);
        })

    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('sarkar food delivery server is running');
});

app.listen(port, () => {
    console.log('Server running at port ', port);
})