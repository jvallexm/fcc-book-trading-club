import React from 'react';

export default class BookView extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state ={
      more: false,
      blurb: "",
      pendingTrades: [],
      offer: ""
    };
    this.moreSwitch = this.moreSwitch.bind(this);
    this.makeOffer = this.makeOffer.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  makeOffer(toId)
  {
    if(this.state.offer=="" || this.state.offer==null)
      return false;
    else
      this.props.sendOffer({
          to: toId,
          from: this.props.userData._id,
          offer: this.state.offer,
          for: this.props.book.isbn
      });
      
   // console.log("sending offer to: " + toId + " from: " + this.props.userData._id);
//    console.log("offer: " + this.state.offer + "for: " + this.props.book.isbn);  
  }
  handleChange(e)
  {
    this.setState({offer: e.target.value});
  }
  componentWillMount()
  {
    //console.log(this.props.userBooks);
    let blurb = this.props.book.description.substr(0,140);
    let lastWord = blurb.lastIndexOf(" ");
    blurb = blurb.substr(0,lastWord);
    let pend = [];
    if(this.props.userData != undefined)
    {
        let pending = this.props.userData.sent_offers;
        for(var i=0;i<pending.length;i++)
        {
            if(pending[i].for == this.props.book.isbn)
              pend.push(pending[i].to);
        }
    }    
    this.setState({blurb: blurb, pendingTrades: pend});
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
                 <div className="lil-pad blurb">
                    {this.state.more 
                    ? <span>{this.props.book.description} <strong onClick={this.moreSwitch}>Less</strong></span>
                    : <span>{this.state.blurb}...<strong onClick={this.moreSwitch}>More</strong></span>}
                 </div>  : ""}
               </div>
                 
                 {this.props.loggedIn ?
                 <div>
                   { this.props.userBooks.indexOf(this.props.book.isbn) == -1
                    ? <button className="btn-primary"
                              onClick={()=>this.props.trade(this.props.book.isbn)}>
                     <i className="fa fa-exchange" /> Trade For This Book
                    </button>    
                    : ""}
                   { this.props.userBooks.indexOf(this.props.book.isbn) == -1 && !this.props.showTrade
                   ? <button className="btn-danger"
                           onClick={()=>this.props.addOne(this.props.book.isbn)}>
                     <i className="fa fa-book" /> Add to My Books
                    </button>  
                   : !this.props.showTrade ?
                   <button className="btn-success">
                     <i className="fa fa-archive" disabled={"disabled"} /> In Your Collection
                    </button>  
                   : ""}
                 </div> : <button className="btn-danger" disabled={"disabled"}>
                     <i className="fa fa-exchange" /> Log In to Trade Books
                   </button>  }
                  
             </div>  
           </div>
           <div className="middle-text">
           {this.props.showTrade && this.props.myBooksObj.length>0 ?
                     this.props.tradePartners.map((d,ii)=>
                     
                       <div className="row trade-btn" key={d+ii}>
                          <div className="col-md-3 middle-text"><strong>{d.name}</strong></div>
                          <div className="col-md-1 middle-text"><i className="fa fa-exchange green" /></div>
                          <div className="col-md-6 middle-text">
                            <select onChange={this.handleChange}>
                              <option value={null}> - </option>
                              {this.props.myBooksObj.map((dd,i)=>
                              
                                <option value={dd.isbn} key={dd.isbn + ii}>
                                  {dd.name.length > 35
                                   ? dd.name.substr(0,32) + "..."
                                   : dd.name
                                  }
                                  </option>
                              )}
                            </select>
                          </div>
                          <div className="col-md-2 middle-text">
                                {this.state.pendingTrades.indexOf(d._id) > -1
                                ? <button className="btn-success" disabled={"disabled"}>Pending</button>
                                : <button className="btn-primary"
                                          onClick={()=>this.makeOffer(d._id)}>Offer</button>}
                          </div>
                       </div>
                     )
                       
                 : this.props.showTrade ? "You need to add some books before you can trade!" :
                 ""}
            </div>     
        </div> 
    );
    
  }
}

