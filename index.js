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
async function updateData(id, updateData) {
    try {
        var findResult = await findData({id:parseInt(id)});
        const _id = findResult[0]._id;
        await client.connect()
        const database = client.db('todo');
        const collection = database.collection('post'); 
        const updateResult = await collection.updateOne( {_id : _id}, {$set : updateData})
        return updateResult;
    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }
}
async function deleteData(id) {
    try {
        var findResult = await findData({id:parseInt(id)});
        const _id = findResult[0]._id;
        await client.connect()
        const database = client.db('todo');
        const collection = database.collection('post'); 
        const deleteResult = await collection.deleteOne( {_id : _id});
        return deleteResult;
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

app.put('/post', async function (req, res) {
    try {
        const result = await updateData(req.body.id, req.body.updateData);
        console.log(result);
        res.status(200).json({ message: '수정 완료' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
});

app.delete('/post', async function (req, res) {
    try {
        const result = await deleteData(req.body.id);
        console.log(result);
        res.status(200).json({ message: '삭제 완료' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
});