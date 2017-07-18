import React from 'react';

export default class BookView extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state ={
      more: false,
      blurb: ""
    };
    this.moreSwitch = this.moreSwitch.bind(this);
  }
  componentWillMount()
  {
    console.log(this.props.userBooks);
    let blurb = this.props.book.description.substr(0,140);
    let lastWord = blurb.lastIndexOf(" ");
    blurb = blurb.substr(0,lastWord);
    this.setState({blurb: blurb});
  }
  moreSwitch()
  {
    this.setState({more: !this.state.more});
  }
  render()
  {
    return(
        <div id={"full-view"} className="text-center middle-text">
          <div id={"close-window"} 
                className="x-box">
            <i className="fa fa-close"
               onClick={this.props.close}/>
          </div> 
           <div className="row">
             <div className="col-md-3">
               <img src={this.props.book.image}/>
             </div> 
             <div className="col-md-9 middle-text ">
               
               <div>
                 <h5><strong>{this.props.book.name}</strong></h5>
                 {this.props.book.authors.length > 0
                 ? <span><strong>By:</strong> {this.props.book.authors.map((d,i)=>
                 
                   <span key={d}>{d}{(i+1)<this.props.book.authors.length?",":""} </span>
                 )}<br/></span>
                 : ""   
                 }
                   <strong>ISBN:</strong> {this.props.book.isbn}     
                 {this.props.book.description!= undefined? 
                 <div className="lil-pad">
                    {this.state.more 
                    ? <span>{this.props.book.description} <strong onClick={this.moreSwitch}>Less</strong></span>
                    : <span>{this.state.blurb}...<strong onClick={this.moreSwitch}>More</strong></span>}
                 </div>  : ""}
               </div>
                 
                 {this.props.loggedIn ?
                 <div>
                   <button className="btn-primary">
                     <i className="fa fa-exchange" /> Trade For This Book
                   </button>    
                   { this.props.userBooks.indexOf(this.props.book.isbn) == -1
                   ? <button className="btn-danger"
                           onClick={()=>this.props.addOne(this.props.book.isbn)}>
                     <i className="fa fa-book" /> Add to My Books
                    </button>  
                   : <button className="btn-success">
                     <i className="fa fa-archive" disabled={"disabled"} /> In Your Collection
                    </button>  
                   }
                 </div> : <button className="btn-danger" disabled={"disabled"}>
                     <i className="fa fa-exchange" /> Log In to Trade Books
                   </button>  }

             </div>  
           </div>  
        </div> 
    );
    
  }
}