const dotenv = require('dotenv');
dotenv.config();
const http = require('http')
const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const cors = require('cors')



const app = express()

//middleware
app.use(cors()); //allow cross origin resource sharing
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true})
);

let port  = process.env.PORT || 5000

let db = mysql.createConnection({
    host: process.env.HOST, //mysql database server hosted in aws-rds
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
})


db.connect((err) => {
    if (err) {
        console.log('Database connection failed')
    }
    else {
        console.log('Database connection successful')
    }
})

app.listen(port, () => console.log('Server started...'))



//api routes

//get all instruments
app.get('/instruments', (req, res) => {
    const sql = 'SELECT * FROM instrument ORDER BY name ASC'

    db.query(sql, (err, result) => {
        if (err) throw err
        else {
            res.send(result)
        }
    })
})

//get all instrument families
app.get('/instrument_families', (req, res) => {
    const sql = 'SELECT * FROM instrument_family'

    db.query(sql, (err, result) => {
        if (err) throw err
        else {
            res.send(result)
        }
    })
})

//get all reason options
app.get('/reason_options/:id', (req, res) => {
    const sql = 'SELECT * FROM reason WHERE id = ?'

    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err
        else {
            res.send(result)
        }
    })
})

//get instruments and their average age started to learn
app.get('/instrument_start_age', (err, res) => {

    const sql = 
    `SELECT post.instrument_id, instrument.name, AVG(post.start_age) as average_start_age, COUNT(post.instrument_id) as count, instrument_family.name as type
    FROM post
     INNER JOIN instrument 
    ON post.instrument_id  = instrument.id
    INNER JOIN instrument_family
     ON instrument.instrument_family_id = instrument_family.id 
    GROUP BY post.instrument_id
    ORDER BY count DESC`

    db.query(sql, (err, result) => {
        if (err) throw err
        else {
            res.send(result)
        }
    })
})


//rest api to create a new record into mysql database
app.post('/instrument_start_age', function (req, res) {
    let postData = req.body;
    db.query('INSERT INTO post SET ?', postData, function (error, results, fields) {
        if (error) {
            res.sendStatus(404);
        }
        else{
            res.end(JSON.stringify(results));
        }
    });
});