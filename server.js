var path = require('path');
var express = require('express');
var app = express(); 
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var request = require("request");
// api key AIzaSyA07NHdSXAhv8cLIyND8qsb4Uvwt0-DVgE

var url = 'mongodb://bookbook:fourbooks@ds161742.mlab.com:61742/books';

app.use(express.static(__dirname));

var server = app.listen(process.env.PORT, function() {
    console.log('Server listening');
});

const io = require('socket.io')(server);

io.on('connection', (socket) => {
    
    console.log('someone connected!');
    socket.on("needs books",()=>{
        console.log("Hey! Someone needs books"); 
        MongoClient.connect(url,(err,db)=>{
           if(err)
            throw err;
           var books = db.collection('books');
           var getAll = (db,err)=>{
              if(err)
               throw err;
              else
              {
                books.find({},{})  
                     .toArray((err,data)=>{
                         if(err)
                          throw err;
                         else
                         {
                           socket.emit("get books",{data: data});
                           db.close();
                         }  
                     });
              }
           };
           getAll(db);
        });
       
    });
    
    socket.on("confirm swap",(data)=>{
        
    });
    
    socket.on("push book", (data)=>{
       MongoClient.connect(url,(err,db)=>{
         if(err)
          throw err;
         console.log("adding a new book");
         var books = db.collection('books');
         var pushIt = ()=>{
             books.insert(data);
             io.sockets.emit("force push",{force: "push"});
         };
         pushIt(db,()=>{db.close();});
       }); 
    });
    
    socket.on('get user data',(data)=>{
       MongoClient.connect(url,(err,db)=>{
          if(err)
           throw err;
          var users = db.collection('users');
          var findOne = ()=>{
              users.findOne({_id: data.user},(err,result)=>{
                  if(err)
                    throw err;
                  if(result)
                  {
                     console.log("getting user data...");
                     socket.emit("user data",{data: result}); 
                  }
                  else
                  {
                    console.log("Making new user...");
                    console.log(data.name);
                    var newUser = {
                       name: data.name,
                       _id: data.user,
                       books: [],
                       pending_trades: [],
                       city: "",
                       state: "",
                       sent_offers: []
                    };
                    socket.emit("user data", {data: newUser});
                    users.insert(newUser);
                  }
              });
          };
          findOne(db,()=>{db.close();});
       });
    });
    
    socket.on("see who has",(data) =>{
        MongoClient.connect(url, (err,db)=>{
           if(err)
             console.log(err);
           console.log("seeing who has " + data.isbn);
           var users = db.collection('users');
           var findAll = ()=>{
               users.find({books: data.isbn},{})
                    .toArray((err,result)=>{
                        if(err)
                         console.log(err);
                        else
                        {
                           //console.log("result: " + JSON.stringify(result));
                           socket.emit("send users",{users: result});
                           db.close();
                        }
                    });
           }
           findAll(db);
        });
    });
    
    socket.on('add book',(data)=>{
       MongoClient.connect(url, (err,db)=>{
          if(err)
            console.log(err);
          console.log("adding " + data.isbn + " to " + data._id);
          var users = db.collection('users');
          var update = () => {
            users.update({_id: data._id},
                         {$push: {books: data.isbn}});
          };
          update(db,()=>{db.close();});
       });  
    });
    
    socket.on('push trade',(data)=>{
        MongoClient.connect(url, (err,db)=>{
          if(err)
            console.log(err);
          console.log("sending trade from " + data.from + " to " + data.to);
          var users = db.collection('users');
          var updateTo = () => {
            console.log("pushing pending trades");  
            users.update({_id: data.to},
                         {$push: {pending_trades: 
                                 {
                                  from: data.from,
                                  offer: data.offer,
                                  for: data.for
                                 }
                         }});
             updateFor(db,()=>{db.close();});             
          };
          var updateFor = () => {
            console.log("pushing sent offers");  
            users.update({_id: data.from},
                         {$push: {sent_offers: 
                                 {
                                  to: data.to,
                                  offer: data.offer,
                                  for: data.for
                                 }
                         }});              
          };
          updateTo(db);
       }); 
    });
    
    socket.on('disconnect', () => {
       console.log('user disconnected');
    });
    

 
});