const express = require('express')
const router = express.Router();
const { MongoClient } = require("mongodb");
require("dotenv").config();
router.use(express.json())
router.use(express.urlencoded({ extended: true }))
const uri = process.env.MONGODB_URI
const { UUID } = require('bson');
const client = new MongoClient(uri, {
    pkFactory: { createPk: () => new UUID().toBinary() }
});

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

router.get('/', async function (req, res) {
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
router.post('/', async function (req, res) {
    try {
        const result = await insertData(req.body);
        console.log(result);
        res.status(200).json({ message: '저장 완료' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
});

module.exports = router;
module.exports.client = client;