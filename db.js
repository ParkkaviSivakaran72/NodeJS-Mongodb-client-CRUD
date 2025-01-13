const mongodb=require('mongodb')
const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId
let database;

async function getDatabase(){
    const client = await MongoClient.connect('mongodb://127.0.0.1:27017'),
    database = client.db('office');
    if(!database){
        console.log('database is not connected')
    }
    return database;
}

module.exports = {
    getDatabase,
    ObjectId
}