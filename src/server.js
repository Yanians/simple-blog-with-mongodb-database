
//this is to used to load credential json file
import fs from 'fs';

import admin from 'firebase-admin';

import express from 'express';

import { default as mongodb } from 'mongodb';

import { fileURLToPath } from 'url';

import path from 'path';

import { db, connectToDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

/*********** FIREBASE SIDE ******************************/
const credentials = JSON.parse(fs.readFileSync('./credential.json'));

admin.initializeApp({
    credential:admin.credential.cert(credentials),
})
/*****************************************/

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, '../build')));

app.get(/^(?!\/api).+/,(req, res)=>{
    res.sendFile(path.join(__dirname,'../build/index.html'));
});

app.use(async(req, res, next) => {

    const { authtoken } = req.headers;

    if(authtoken){
        try{
            req.user = await admin.auth().verifyIdToken(authtoken);
        }catch{
            return res.sendStatus('Bad request Arise here becasue someone is hacked in your account: ',400); // bad request
        }
    }

    req.user = req.user || {};
    next();
});

app.get('/api/articles/:name', async (req, res) => {

        const { name } = req.params;
        const { uid } = req.user;
        const article = await db.collection('articles').findOne({ name, });

         if(article){
            const upvoteId = article.upvoteId || [];
            article.canUpvote = uid && !upvoteId.includes(uid);
            res.json(article);
         }else{
            res.sendStatus(404); // not found
         }
});

app.use((req, res, next)=>{
    if(req.user){
        next()
    }else {
        res.sendStatus(401); //not allowed to access resources or login error code
    }
})

app.post('/api/articles/:name/upvote', async (req, res) => {

        const { name } = req.params;

        const { uid } = req.user;

         const article = await db.collection('articles').findOne({ name, });
         console.log(typeof article);

         if(article){
            const upvoteId = article.upvoteId || [];
            const canUpvote = uid && !upvoteId.includes(uid);

              if(canUpvote){
                  await db.collection('articles').updateOne({ name},
                     {
                        '$inc':{upvotes:1,}
                     },
                     {
                        '$push':{ upvoteIds:uid }
                     },
                 );
              }
        
     const updatedArticle = await db.collection('articles').findOne({ name });

           res.json(updatedArticle);        

  }else{
    res.send('That article doesn\'t exist ');
  }         
});

app.post('/api/articles/:name/comment', async(req, res)=>{

      const { name } = req.params;
      const { text } = req.body;
      const { email } = req.user;
     	  const articleInfo = await db.collection('articles').updateOne({ name },{
            '$push':{comments:{ email, text }},
          });

     	  const article = await db.collection('articles').findOne({name})

      if(article){

          res.json(article);
      }else{
         res.send('That article doesn\'t exist');        
      }
     	 
});

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname + '../build/index.html'));
// });

const PORT = process.env.PORT || 8000;
connectToDb(()=>{
     app.listen(PORT,(req, res)=>{
        console.log(`Listening on port ${PORT}`);
    });
});
    


