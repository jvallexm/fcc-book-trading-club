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
                       pending_trades: []
                    };
                    socket.emit("user data", {data: newUser});
                    users.insert(newUser);
                  }
              });
          };
          findOne(db,()=>{db.close();});
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
    
    socket.on('disconnect', () => {
       console.log('user disconnected');
    });
    

 
});