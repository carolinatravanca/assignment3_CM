const server = require('express')()
const mongodb = require('mongodb')
const fs = require ('fs');
const client = new mongodb.MongoClient('mongodb://localhost:3000')

