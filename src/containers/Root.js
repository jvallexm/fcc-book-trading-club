import React from 'react'
import $ from 'jquery';
import FacebookLogin from 'react-facebook-login';
import io from 'socket.io-client';
const socket=io();
const searchFront = 'https://www.googleapis.com/books/v1/volumes?q=isbn:';
const searchBack = '&key=AIzaSyA07NHdSXAhv8cLIyND8qsb4Uvwt0-DVgE';
import BookView from './BookView.js';

export default class App extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state =
      {
        books: [],
        booksGrid:[],
        grayOut: false,
        whichBook: {name: "placeholder",description: "a placeholder book", isbn: "fitty", _id: 12, authors: []},
        search: "",
        message: "",
        newest: true,
        aToZ: false,
        loggedIn: false,
        userData: undefined,
        userBooks: ["none"],
        user: undefined,
        myBooks: false,
        addBook: false
      };
    this.grayDisplay = this.grayDisplay.bind(this);
    this.closeOut = this.closeOut.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.makeGrid = this.makeGrid.bind(this);
    this.getNewBook = this.getNewBook.bind(this);
    this.sortBooks = this.sortBooks.bind(this);
    this.responseFacebook = this.responseFacebook.bind(this);
    this.addToCollection = this.addToCollection.bind(this);
    this.showMyBooks = this.showMyBooks.bind(this);
    this.showAllBooks = this.showAllBooks.bind(this);
    this.addNewBook = this.addNewBook.bind(this);
  }
  componentWillMount()
  {
    if(this.state.books.length==0)
      socket.emit("needs books",{needs: "books"});
    socket.on("get books",(data)=>{
       let sortedData = data.data.sort((a,b)=>{
         if(a._id > b._id)
          return -1;
         else
          return 1;
       });
       if(!this.state.myBooks)
          this.makeGrid(sortedData);
       else
          this.showMyBooks(sortedData);
       this.setState({books: sortedData});
    });
    socket.on("force push",()=>{
      socket.emit("needs books",{needs: "books"});
    });
    socket.on("user data",(data)=>{
      console.log("getting books: " + data.data.books);
      this.setState({userData: data.data, userBooks: data.data.books});
    });
  }
  addNewBook()
  {
    this.setState({addBook: true, grayOut: true});
  }
  responseFacebook(response)
  {
    socket.emit("get user data",
                {user: response.userID,
                 name: response.name  
                });
    this.setState({user: response, loggedIn: true});
  }
  showAllBooks()
  {
    this.makeGrid(this.state.books);
    this.setState({myBooks: false});
  }
  showMyBooks(books)
  {
    var myBooks = [];
    for(var j=0;j<this.state.userBooks.length;j++)
    {
      for(var i=0;i<books.length;i++)
      {
        if(books[i].isbn == this.state.userBooks[j])
          myBooks.push(books[i]);
      }
    }  
    this.makeGrid(myBooks);
    this.setState({myBooks: true});
  }
  addToCollection(isbn)
  {
    //console.log("adding...");
    var userBooks = this.state.userBooks;
    userBooks.push(isbn);
    console.log("new user books: " + userBooks);
    socket.emit("add book",{isbn: isbn, _id:this.state.user.userID});
    this.setState({userBooks: userBooks});
  }
  getNewBook()
  {
    if(this.state.search.length <1)
      return false;
    $.getJSON(searchFront+this.state.search+searchBack,function(data){
      if(data.totalItems==0)
       this.setState({message: "Not found"});
      if(data==undefined) 
       this.setState({message: "Error Connecting to Database"});
      let isbnCheck = false;
      for(var i=0;i<this.state.books.length;i++)
      {
        if(this.state.books[i].isbn==this.state.search)
         isbnCheck = true;
      }
      if(isbnCheck)
       this.setState({message: "This book is already in our system."});
      else
      {
        let today = new Date();
        let authors = [];
        if(data.items[0].volumeInfo.authors!=undefined)
          authors = data.items[0].volumeInfo.authors;
        //console.log(data.items[0].volumeInfo);
        socket.emit("push book",{
          _id: Math.floor(today.getTime()/1000),
          authors: authors,
          name: data.items[0].volumeInfo.title,
          description: data.items[0].volumeInfo.description,
          image:  data.items[0].volumeInfo.imageLinks.thumbnail,
          isbn: this.state.search
        });
        this.addToCollection(this.state.search);
        this.setState({message: "Found!!", addBook: false, grayOut: false});
      }  
    }.bind(this));
  }
  makeGrid(data)
  {
    let columns=[];
    let row=[];
    for(var i=0;i<data.length;i++)
    {
      row.push(data[i]);
      if(((i+1)%6==0 && i!=0) || i+1 == data.length)
      {
        columns.push(row);
        row=[];
      }  
    }
    this.setState({booksGrid: columns});
  }
  grayDisplay(obj)
  {
    console.log("user books: " + this.state.userBooks);
    this.setState({grayOut: true, whichBook: obj});
  }
  closeOut()
  {
    this.setState({grayOut: false, addBook: false});
  }
  handleChange(e)
  {
    if(/[^\d]/.test(e.target.value))
      return false;
    this.setState({search: e.target.value});
  }
  sortBooks(field,a_z)
  {
    console.log("dng");
  }
  render()
  {
     return(
      <div id={"whole-thing"}> 
        {this.state.grayOut ?
        <div id={"gray-out"}
             className="text-center container-fluid">
         <div className="text-center container-fluid">    
           {!this.state.addBook ?
           
            <BookView book={this.state.whichBook} 
                      close={this.closeOut}
                      loggedIn={this.state.loggedIn}
                      addOne={this.addToCollection}
                      userBooks={this.state.userBooks}/>
            : 
                <div id={"search-view"}>
                   <div className="blue-lob">
                   <h3>Add a New Book to Your Collection</h3>
                   </div>  
                   <div><strong>{this.state.message}</strong></div>
                   <div className="middle-text">
                        <div className="lilpad">
                        Search by ISBN: <input placeholder={"ISBN 13"} 
                                              value={this.state.search}
                                              onChange={this.handleChange}/>
                        </div>
                        <div className="lilpad">
                          <button className="btn btn-primary"   
                                onClick={this.getNewBook}>Submit</button>    
                           <button className="btn btn-danger"
                                   onClick={this.closeOut}>Cancel</button>
                        </div>
                   </div>
                 </div>
     
           }         
         </div>
         </div>: ""}
            
         
        <div id={"app-view"} className="text-center container-fluid">
        
        <div className="head text-center container-fluid"> 
          <h1>Book Stop N' Swap!</h1>
          <h5>Trade Books With Real Human People!</h5>          
        </div> 
        
        
        <div className="margin-10">
          {
            !this.state.loggedIn
            ?
            <FacebookLogin 
              cssClass="btn btn-primary"
              appId='1927284784209091'
              autoLoad={true}
              fields="name,picture"
              callback={this.responseFacebook}
              onClick={console.log("sdfadsf")}/>
            : 
            <div>
                {!this.state.myBooks
                 ?  <button className="btn-success btn-margin"
                          onClick={()=>this.showMyBooks(this.state.books)}>My Books <i className="fa fa-book"/></button>
                 :  <button className="btn-primary"
                            onClick={this.showAllBooks}>All Books <i className="fa fa-book"/></button>}
                {this.state.myBooks ?            
                <button className="btn-success btn-margin"
                        onClick={this.addNewBook}>Add a Book <i className="fa fa-archive"/></button>  : ""}
                <button className="btn-primary">Pending Trades <i className="fa fa-exchange"/></button>
                <button className="btn-primary">Settings <i className="fa fa-gears"/></button>
            </div>  
          }    
        </div>  
        
        {this.state.booksGrid.map((col,i)=>
            <div className="row" key={"col" + i}>                        
              {col.map((row,ii)=>
                <div className="col-md-2">
                   <div className="book middle-text"
                        onClick={()=>this.grayDisplay(row)}>      
                        <div key={row.name}>
                          <img src={row.image} title={row.name}/>  
                        </div>
                   </div>  
                </div>         
              )}   
                                    
            </div>                     
        )}                    
        </div>  
      </div>  
      );
  }
}



