const express = require('express')
var bodyParser = require('body-parser')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

mongoose.connect('mongodb://localhost:27017/mywebsitedb', {useNewUrlParser: true, useUnifiedTopology: true})

const Account = new Schema({
    username: String,
    password: String,
    email: String
})

const AccModel = mongoose.model("Account", Account)

app.get('/', (req, res) => res.send('Like this video! owifaiwofk'))

app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/signup.html')
})

app.post('/api/signup', async (req, res) => {
    var result = {success: false}

    try{
        //Search if username is taken
        var foundDoc = await new Promise((resolve, reject) => {
            AccModel.findOne({username: req.body.username}, function(err, doc){
                if(err) reject(err)
                resolve(doc)
            })
        })
        if(foundDoc) throw "Error: Account already exists with this username!"

        //Make password safe
        var hashedPass = await new Promise((resolve, reject) => {
            bcrypt.hash(req.body.password, 10, function(err, hash) {
                // Store hash in your password DB.
                if(err) reject(err)
                resolve(hash)
            });
        })

        //Prepare data to save
        var accDoc = new AccModel()
        accDoc.username = req.body.username
        accDoc.password = hashedPass
        accDoc.email = req.body.email
        
        //Save to database
        await new Promise((resolve, reject) => {
            accDoc.save(function(e){
                if(e) reject(e)
                resolve()
            })
        })

        result.success = true
    }
    catch(e){
        if(typeof e === "string") result.reason = e
        else {
            result.reason = "Server error"
            console.log(e)
        }
    }

    res.json(result)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))