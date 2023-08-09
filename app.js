const express = require('express')
const path = require('path');
const {ObjectId} = require('mongodb')
const { connectToDb, getDb } = require('./db')
const cors = require('cors');
//init app and middleware

const app = express()
app.use(express.json())
app.use(cors());  // Enable CORS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
//db connection
let db

app.get('/', (req, res) => {
    res.render('homepage.ejs');
});

connectToDb((err) => {
    if(!err){
        app.listen(3000, () => {
            console.log('Server is running on port 3000')
        })
        db = getDb();
    }
})
//middleware
app.use(express.static(path.join(__dirname, 'public')));

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

app.post('/users', (req, res) => {
    const user = req.body
    db.collection('users')
    .insertOne(user)
    .then(result => {
        res.status(200).json(result)
    })
    .catch(err => {
        res.status(500).json({mssg: "Error connecting to db", error: err.message})
    })
})

app.get('/users/:url', (req, res) => {
    db.collection('users')
    .findOne({url: req.params.url})  // Search based on the 'url' field
    .then(user => {
        if (user) {
            res.status(200).json({ingredients: user.ingredients});  // Send the 'ingredients' of the 'user' object
        } else {
            res.status(404).json({mssg: "User not found"});
        }
    })
    .catch(err => {
        res.status(500).json({mssg: "Error connecting to db", error: err.message});
    });
});

// app.get('/users', (req, res) => {
//     db.collection('users')
//     .find({})
//     .toArray((err, users) => {
//         if (err) {
//             return res.status(500).json({mssg: "Error connecting to db", error: err.message});
//         }
//         res.status(200).json(users);
//     });
// });

app.get('/:username', (req, res) => {
    // Fetch user data based on the username from the URL
    const username = req.params.username;
    db.collection('users')
    .findOne({url: username})
    .then(user => {
        if (user) {
            // Render a user-specific page with their supplement stack
            res.render('users.ejs', { user: user });
        } else {
            // Handle user not found - perhaps redirect to a 404 page
            res.status(404).send('User not found');
        }
    })
    .catch(err => {
        res.status(500).json({mssg: "Error connecting to db", error: err.message});
    });
});