import React from 'react';

export default class TradeView extends React.Component
{
  constructor(props)
  {
    super(props);
    this.cancelTrade = this.cancelTrade.bind(this);
    this.confirmTrade = this.confirmTrade.bind(this);
    this.state = {badRequests: []};
  }
  componentWillMount()
  {
    let getNames = [];
    let badRequests = [];
    //console.log(this.props.userData);
    for(var i=0;i<this.props.userData.sent_offers.length;i++)
    {
      if(getNames.indexOf(this.props.userData.sent_offers[i].to)==-1)
        getNames.push(this.props.userData.sent_offers[i].to);
      if(this.props.userData.books.indexOf(this.props.userData.sent_offers[i].offer)==-1)
        badRequests.push({from: this.props.userData._id, to: this.props.userData.sent_offers[i].to, offer: this.props.userData.sent_offers[i].offer, for: this.props.userData.sent_offers[i].for});
    }
    for(var j=0;j<this.props.userData.pending_trades.length;j++)
    {
      if(getNames.indexOf(this.props.userData.pending_trades[j].from)==-1)
        getNames.push(this.props.userData.pending_trades[j].from);
    }
    this.props.socket.emit("get user names",{names: getNames});
    
    this.props.socket.on("send users", (data)=>{
      //let badRequests = [];
      for(var k=0;k<this.props.userData.pending_trades.length;k++)
      {
        for(var l=0;l<data.users.length;l++)
        {
          if(this.props.userData.pending_trades[k].from == data.users[l]._id)
          {
            if(   this.props.userData.books.indexOf(this.props.userData.pending_trades[k].for) == -1
               || data.users[l].books.indexOf(this.props.userData.pending_trades[k].offer) == -1)
            badRequests.push({from: data.users[l]._id, to: this.props.userData._id, offer: this.props.userData.pending_trades[k].offer, for: this.props.userData.pending_trades[k].for});   
          }  
        }
      }
      for(var m=0;m<badRequests.length;m++)
      {
        this.props.socket.emit("cancel swap", badRequests[m]);
      }
    });
    
  }

  confirmTrade(from,to,offer,ffor)
  {
    let toCancel = {
      to: to,
      from: from,
      offer: offer,
      for: ffor
    };
    this.props.socket.emit("confirm swap", toCancel);
    this.props.socket.emit("cancel swap", toCancel);
  }
  cancelTrade(to,from,offer,ffor)
  {
    let toCancel = {
      to: to,
      from: from,
      offer: offer,
      for: ffor
    };
    this.props.socket.emit("cancel swap", toCancel);
  }
  render()
  {
    return(

      <div id={"trade-view"}>
          <div className="blue-lob">
            <h4>Pending Trades</h4>
          </div>
          { this.props.userData.pending_trades.length < 1
          ? <div className="row trade-btn">
              <div className="col-md-12">No pending trades yet.</div>
            </div>
          : this.props.userData.pending_trades.map((d,i)=>
            <div className="row trade-btn" key={d+i+"f"}>
              <div className="col-md-2 middle-text">
                 {this.props.tradePartners.map((da,i)=>
                   d.from == da._id ? da.name : ""
                 )}
              </div>
              <div className="col-md-4 middle-text">
                 <strong>{
                   this.props.books.map((da,i)=>
                     (da.isbn == d.offer) ? da.name : ""
                   )}</strong>
              </div>
              <div className="col-md-1 green middle-text">
                 <i className="fa fa-exchange"/>
              </div>
              <div className="col-md-4 middle-text">
                 <strong>{
                   this.props.books.map((da,i)=>
                     (da.isbn == d.for) ? da.name : ""
                   )}</strong>
              </div>
              <div className="col-md-1">
                 <button className="btn-primary"
                          onClick={()=>this.confirmTrade(d.from,this.props.userData._id,d.offer,d.for)}>Accept</button>
              </div>
            </div>
          )}
          <div className="blue-lob">
            <h4>Sent Offers</h4>
          </div>
          { this.props.userData.sent_offers.length < 1
          ? <div className="row trade-btn">
              <div className="col-md-12">You don't have any sent offers. Go trade some books!</div>
            </div>
          :this.props.userData.sent_offers.map((d,i)=>
            <div className="row trade-btn" key={d+i+"g"}>
              <div className="col-md-2 middle-text">
                 {this.props.tradePartners.map((da,i)=>
                   d.to == da._id ? da.name : ""
                 )}
              </div>
              <div className="col-md-4 middle-text">
                 <strong>{
                   this.props.books.map((da,i)=>
                     (da.isbn == d.offer) ? da.name : ""
                   )}</strong>
              </div>
              <div className="col-md-1 green middle-text">
                 <i className="fa fa-exchange"/>
              </div>
              <div className="col-md-4 middle-text">
                 <strong>{
                   this.props.books.map((da,i)=>
                     (da.isbn == d.for) ? da.name : ""
                   )}</strong>
              </div>
              <div className="col-md-1">
                 <button className="btn-danger"
                         onClick={()=>this.cancelTrade(d.to,this.props.userData._id,d.offer,d.for)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
 
    );
  }
}
