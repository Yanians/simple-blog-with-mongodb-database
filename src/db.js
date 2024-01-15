
import { default as mongodb } from 'mongodb';

let MongoClient = mongodb.MongoClient;

let db;

const connectToDb = async (cb) => {
    const client = new MongoClient(`mongodb+srv://user_tres:9Jawapnet@cluster0.oskef.mongodb.net/?retryWrites=true&w=majority`, { useNewUrlParser: true,useUnifiedTopology:true, });
    await client.connect();
    db = client.db('my-blog');
    cb();
};

export {
    db,
    connectToDb,
 };   

 // const withDB = async (operations, res) => {
//     try {
//         const client = await MongoClient.connect(`mongodb+srv://user_tres:9Jawapnet@cluster0.oskef.mongodb.net/?retryWrites=true&w=majority`, { useNewUrlParser: true,useUnifiedTopology:true, });
//         await operations(db);

//          client.close();
//     } catch (error) {
//         res.status(500).json({ message: 'Error connecting to db', error });
//     }
// }
