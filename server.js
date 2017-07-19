var path = require('path');
var express = require('express');
var app = express(); 
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://bookbook:fourbooks@ds161742.mlab.com:61742/books';
const io = require('socket.io')(server);


app.use(express.static(__dirname));

app.listen(process.env.PORT || 3000, function() {
    console.log('Server listening');
});

var server = app.listen(process.env.PORT || 3000, function() {
    console.log('Server listening');
});



var currentUsers = [];

io.on('connection', (socket) => {
    
    console.log("new connection: " + socket.id);
    //console.log(typeof socket.id);
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
                     var socketCheck = false;
                     for(var j=0;j<currentUsers.length;j++)
                     {
                         if(socket.id == currentUsers[j].socket)
                           socketCheck=true;
                     }
                     if(!socketCheck)
                     {
                         currentUsers.push({name: result.name, _id: data.user, socket: socket.id}); 
                         console.log("user connected: " + result.name)
                         var userArray = [];
                         for(var i=0;i<currentUsers.length;i++)
                         {
                              userArray.push(currentUsers[i].name);
                         }
                         console.log(userArray);
                     }     
                     else   
                       console.log("this user has already connected");
                     console.log("getting user data...");
                     socket.emit("user data",{data: result}); 
                  }
                  else
                  {
                    currentUsers.push({name: data.name, _id: data.user, socket: socket.id});
                    var userArray = [];
                     for(var i=0;i<currentUsers.length;i++)
                     {
                         userArray.push(currentUsers[i].name);
                     }
                    console.log(userArray);
                    console.log("New user: " + data.name);
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
    
    socket.on("get user names",(data) =>{
        MongoClient.connect(url, (err,db)=>{
           if(err)
             console.log(err);
           console.log("getting names for: " + data.names);
           var users = db.collection('users');
           var findAll = ()=>{
               users.find({_id: {$in: data.names}},{})
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
           };
           findAll(db);
        });
    });
    
    
    socket.on("see who has",(data) =>{
        MongoClient.connect(url, (err,db)=>{
           if(err)
             console.log(err);
           console.log("seeing who has " + data.isbn);
           var users = db.collection('users');
           var findAll = ()=>{
               users.find({books: {$all: [data.isbn]}},{})
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
             for(var i=0;i<currentUsers.length;i++)
             {
                if(currentUsers[i]._id == data.to)
                  socket.broadcast.to(currentUsers[i].socket).emit("force user update",{force: "update"});  
             }
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
    
    socket.on("update user",(data)=>{
       console.log("updating user: " + data._id);
        MongoClient.connect(url, (err,db)=>{
           if(err)
             console.log(err);
           var users = db.collection('users');
           var update = () => {
             users.update({_id: data._id},{$set: {name: data.name, state: data.state, city: data.city}})
             socket.emit("force user update",{force: "update"});  
           };
           update(db,()=>{db.close();});
           
        });   
    });
        
    socket.on("confirm swap",(data)=>{
        console.log("From: " + data.from + " To: " + data.to);
        console.log("Offer: " + data.offer + "For: " + data.for);
        MongoClient.connect(url, (err,db)=>{
           if(err)
             console.log(err);
           var users = db.collection('users');
           var pushOffer = () => {
             console.log("pushing " + data.offer + " to " + data.to);
             users.update({_id: data.to},{$push: {books: data.offer}});
             pushFor(db);
           };
           var pushFor = () => {
             console.log("pushing " + data.for + " to " + data.from);
             users.update({_id: data.from},{$push: {books: data.for}});
             pullOffer(db); 
           };
           var pullOffer = () => {
             console.log("pulling " + data.for + " from " + data.to);  
             users.update({_id: data.to},{$pull: {books: data.for}});
            // socket.emit("force user update",{force: "update"}); 
             pullFor(db,()=>{db.close();});
           };
           var pullFor = () => {
             console.log("pulling " + data.offer + " from " + data.from);  
             users.update({_id: data.from},{$pull: {books: data.offer}});  
           };
           pushOffer(db);
        }); 
    });
    
    socket.on("cancel swap",(data)=>{
        MongoClient.connect(url, (err,db)=>{
          if(err)
            console.log(err);
          console.log("pulling request from " + data.from + " to " + data.to);
          var users = db.collection('users');
          var updateTo = () => {
            console.log("pulling pending trades");  
            users.update({_id: data.to},
                         {$pull: {pending_trades: 
                                 {
                                  from: data.from,
                                  offer: data.offer,
                                  for: data.for
                                 }
                         }});
             updateFor(db,()=>{db.close();});             
          };
          var updateFor = () => {
            console.log("pulling sent offers");  
            users.update({_id: data.from},
                         {$pull: {sent_offers: 
                                 {
                                  to: data.to,
                                  offer: data.offer,
                                  for: data.for
                                 }
                         }}); 
            for(var i=0;i<currentUsers.length;i++)
            {
               console.log("user id: " + currentUsers[i]._id);
               if(currentUsers[i]._id == data.from || currentUsers[i]._id == data.to)
               {
                  console.log("yes " + currentUsers[i]._id + " is involved"); 
                  console.log("current user socket: " + currentUsers[i].socket);
                  console.log("this socket: "  + socket.id);
                  socket.broadcast.to(currentUsers[i].socket).emit("force user update",{force: "update"});
                  socket.broadcast.to(currentUsers[i].socket).emit("force push",{force: "push"});   
               }
            }
            socket.emit("force user update",{force: "update"});
            socket.emit("force push",{force: "push"});
          };
          updateTo(db);
       });         
    });
    
    socket.on('disconnect', () => {
       var whoDisconnected = "";
       for(var i=0;i<currentUsers.length;i++)
       {
          if(socket.id == currentUsers[i].socket)
          {
             whoDisconnected = currentUsers[i].name; 
             currentUsers.splice(i,1);
          }      
       }
       console.log('user disconnected: ' + whoDisconnected);
     //  console.log("users connected: " + JSON.stringify(currentUsers));
    });
    

 
});

