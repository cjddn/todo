const express = require('express')
const app = express()
app.use('/public', express.static('public'));
const postRouter = require('./routes/post.js');
app.use('/post', postRouter);


async function main() {
    try {
        await postRouter.client.connect()
        app.listen(8080, function () {
            console.log('listening on port 8080')
        })
    } finally {
        await postRouter.client.close();
    }
}
main().catch(console.dir);


app.get('/', async function (req, res) {
    const todoList = await postRouter.findData();
    res.render('index.ejs',{list:todoList});
})

