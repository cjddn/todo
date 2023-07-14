const express = require('express')
const app = express()
const { MongoClient } = require("mongodb");
require("dotenv").config();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const uri = process.env.MONGODB_URI
const { UUID } = require('bson');
const client = new MongoClient(uri, {
    pkFactory: { createPk: () => new UUID().toBinary() }
});
async function main() {
    try {
        await client.connect()
        app.listen(8080, function () {
            console.log('listening on port 8080')
        })
    } finally {
        await client.close();
    }
}
main().catch(console.dir);

async function insertData(datas) {
    try {
        await client.connect()
        const database = client.db('todo');
        const collection = database.collection('post');
        let autoIncrement = await collection.countDocuments({}, { hint: "_id_" }) + 1;
        const currentDate = new Date().toISOString().substring(0, 10);
        datas.id = autoIncrement;
        datas.createdAt = currentDate;
        datas.isCompleted = 'n';
        const insertResult = await collection.insertOne(datas);
        return insertResult;
    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }

}
async function findData(where = {}) {
    try {
        await client.connect()
        const database = client.db('todo');
        const collection = database.collection('post');
        const findResult = await collection.find(where).toArray();
        return findResult;
    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }

}
app.get('/', async function (req, res) {
    const todoList = await findData();
    res.render('index.ejs',{list:todoList});
})

app.get('/post', async function (req, res) {
    try {
        const where = req.query.isCompleted ? req.query : {}
        const todoList = await findData(where);
        console.log(todoList);
        res.status(200).json({ list: todoList });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
})
app.post('/post', async function (req, res) {
    try {
        const result = await insertData(req.body);
        console.log(result);
        res.status(200).json({ message: '저장 완료' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
});
