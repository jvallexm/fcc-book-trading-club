import React from 'react';

export default class SettingsView extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {
       userInfo: {},
       messages: [],
       states: ["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","PR","RI", "SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"]
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  componentWillMount()
  {
    let userData = this.props.userData;
    //console.log(this.props.userData);
    this.setState({userInfo: userData});
  }
  handleChange(e)
  {
    if(e.target.name == "city" && e.target.value > 30)
      return false;
    let userInfo = this.state.userInfo;
    userInfo[e.target.name] = e.target.value;
    this.setState({userInfo: userInfo});
  }
  handleSubmit()
  {
    let messages = [];
    if(this.state.userInfo.name == "")
      messages.push("User name cannot be blank");
    if(this.state.userInfo.city == "")
      messages.push("City cannot be blank");
    if(this.state.userInfo.state=="-")
      messages.push("State cannot be blank");
      
    if(messages.length > 0)
      this.setState({messages: messages});

     
    else
    {
      this.props.socket.emit("update user",{
          _id: this.props.userData._id,
          name: this.state.userInfo.name,
          city: this.state.userInfo.city,
          state: this.state.userInfo.state
      });
      this.props.update();
    }
  }
  render()
  {
    return(
      <div id={"settings-view"} className="text-center container-fluid">
           <div className="blue-lob">
           <h3>Edit Your User Information <i className="fa fa-gears" /></h3>
           </div> 
              <div className={this.state.messages.length > 0 ? "lilpad error" : "error"}>
                 {this.state.messages.map((d,i)=> <p key = {d+i}>{d}</p> )}
              </div>  
              <div className="lilpad">
              <div className="row">
                <div className="col-sm-2"><strong>Name:</strong></div>
                 <div className="col-sm-10"> 
                      <input placeholder={"Your Name"} 
                             className="width100"
                             value = {this.state.userInfo.name}
                             name={"name"}
                             onChange={this.handleChange}/>
                 </div>  
              </div>  
              <div className="row">
                <div className="col-sm-2"><strong>City:</strong></div>
                 <div className="col-sm-6"> 
                    <input placeholder={"City"}  
                           className="width100"
                           value = {this.state.userInfo.city}
                           name={"city"}
                           onChange={this.handleChange}/>
                  </div>  
                   <div className="col-sm-2"><strong>State:</strong></div>
                  <div className="col-sm-2"> 
                     <select className="height100"
                             name={"state"}
                             value = {this.state.userInfo.State}
                             onChange={this.handleChange}>
                       <option value={null}>-</option>
                       {this.state.states.map((d,i)=>
                       <option value={d}
                               key={d}
                               selected={this.state.userInfo.state==d?"selected":""}> {d}</option>
                                            )}
                     </select>  
                  </div>  
              </div>  
              <div className="lilpad">
               <button className="btn-primary"
                       onClick={this.handleSubmit}> Submit </button>
               <button className="btn-danger"
                       onClick={this.props.close}> Cancel </button>         
              </div> 
        </div>   
         </div>
        );
  }
  
}