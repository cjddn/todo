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
            console.log('listening on 8080')
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
        const insertResult = await collection.insertOne(datas);
        return insertResult;
    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }

}

app.get('/', function (req, res) {
    res.render('index.ejs')
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
