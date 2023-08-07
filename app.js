const express = require('express')
const {ObjectId} = require('mongodb')
const { connectToDb, getDb } = require('./db')
const cors = require('cors');
//init app and middleware

const app = express()
app.use(express.json())
app.use(cors());  // Enable CORS
//db connection
let db

connectToDb((err) => {
    if(!err){
        app.listen(3000, () => {
            console.log('Server is running on port 3000')
        })
        db = getDb();
    }
})
//middleware


//routes
app.get('/ingredients', (req, res) => {
    db.collection('ingredients')
    .find()
    .sort({name:1})
    .toArray()  // Convert cursor to an array, which returns a promise
    .then(ingredients => {  // ingredients is now an array of documents
        res.status(200).json(ingredients)
    })
    .catch(err => {  // Include the actual error message in the response
        res.status(500).json({mssg: "Error connecting to db", error: err.message})
    })
})

app.get('/ingredients/:name', (req, res) => {
    db.collection('ingredients')
    .findOne({name: req.params.name})
    .then(ingredient => {
        res.status(200).json(ingredient)
    })
    .catch(err => {
        res.status(500).json({mssg: "Error connecting to db", error: err.message})
    })
})


app.post('/ingredients', (req, res) => {
    const ingredient = req.body
    db.collection('ingredients')
    .insertOne(ingredient)
    .then(result => {
        res.status(200).json(result)
    })
    .catch(err => {
        res.status(500).json({mssg: "Error connecting to db", error: err.message})
    })
})

app.delete('/ingredients/:name', (req, res) => {
    if(!req.params.name){
        res.status(400).json({mssg: "Missing name parameter"})
    }   
    db.collection('ingredients')
    .deleteOne({name: req.params.name})
    .then(result => {
        res.status(200).json(result)
    })
    .catch(err => {
        res.status(500).json({mssg: "Error connecting to db", error: err.message})
    })
})

app.patch('/ingredients/:name', (req, res) => {
    const updates = req.body
    if(!req.params.name){
        res.status(400).json({mssg: "Missing name parameter"})
    }   
    db.collection('ingredients')
    .updateOne({name: req.params.name}, {$set: updates})
    .then(result => {
        res.status(200).json(result)
    })
    .catch(err => {
        res.status(500).json({mssg: "Error connecting to db", error: err.message})
    })
})

app.get('/ingredients/:name/fda-limit', (req, res) => {
    db.collection('ingredients')
    .findOne({name: req.params.name})
    .then(ingredient => {
        if (ingredient) {
            res.status(200).json({FDA_limit: ingredient.FDA_limit});
        } else {
            res.status(404).json({mssg: "Ingredient not found"});
        }
    })
    .catch(err => {
        res.status(500).json({mssg: "Error connecting to db", error: err.message});
    });
});