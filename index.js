const express = require('express')
const app = express()
const { MongoClient } = require("mongodb");
require("dotenv").config();
const uri = process.env.MONGODB_URI
const { UUID } = require('bson');
const client = new MongoClient(uri, {
  pkFactory: { createPk: () =>  new UUID().toBinary() }
});
async function main() {
  try {
    await client.connect()
    app.listen(8080, function() {
        console.log('listening on 8080')
    })
  } finally {
    await client.close();
  }
}
main().catch(console.dir);

async function insertData(){
  const database = client.db('todo');
  const collection = database.collection('post');
  let autoIncrement = await collection.countDocuments({}, { hint: "_id_" }) + 1;
  const insertResult = await collection.insertOne({id: autoIncrement, a: 1});
  console.log('저장 결과 =>', insertResult);
}

app.get('/', function(req, res) { 
  res.render('index.ejs')
})

app.get('/list', function(req, res) { 
  res.send('리스트 페이지')
})
