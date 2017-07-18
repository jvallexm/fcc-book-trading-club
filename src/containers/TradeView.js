import React from 'react';

export default class TradeView extends React.Component
{
  constructor(props)
  {
    super(props);
    this.cancelTrade = this.cancelTrade.bind(this);
    this.confirmTrade = this.confirmTrade.bind(this);
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
                 {d.from}
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
                 {d.to}
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
