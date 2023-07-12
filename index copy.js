const express = require('express')
const app = express()
// app.use(express.urlencoded({extended: true})) 
const { UUID } = require('bson');
const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://abcde:des04013@cluster-todo.drh3qp0.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  pkFactory: { createPk: () =>  new UUID().toBinary() }
});
async function main() {
  try {
    await client.connect()
    const database = client.db('todo');
    const movies = database.collection('post');
    const findData = await movies.findOne({id: 10});
    console.log(findData._id.toString());
    // let id = await movies.countDocuments({}, { hint: "_id_" });
    // const insertResult = await movies.insertOne({ aa: 1, id: id + 1});
    // console.log('Inserted documents =>', insertResult);
    
    app.listen(8080, function() {
        console.log('listening on 8080')
    })  
  } finally {
    await client.close();
  }
}
main().catch(console.dir);

app.get('/', function(req, res) { 
  res.send('메인페이지')
})

app.get('/post', function(req, res) { 
  res.send('리스트 페이지')
})

app.post('/post', function(req, res) { 
  console.log(req)
})