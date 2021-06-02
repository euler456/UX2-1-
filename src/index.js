import React from 'react';
import ReactDOM from 'react-dom';
import "./index.css";
import $, { extend } from 'jquery';
//"homepage": "http:euler456.github.io/UX2",
//import Redirect from 'react-router'
//import { fetchlogin, fetchregister,fetchaccountexists ,fetchisloggedin,fetchlogout } from './api/app/app.js';
//"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --disable-gpu --user-data-dir="C:\tmp"
import {
  Route,
  NavLink,
  HashRouter,
  Redirect ,
  BrowserRouter,
  Router
} from "react-router-dom";
const green = '#006400';
const black = '#000000';
class Main extends React.Component {
  constructor(props){
    super(props);
    this.state = { color: green };
    this.changeColor = this.changeColor.bind(this);
    this.Logout = this.Logout.bind(this);
  }
  changeColor(){
    const newColor = this.state.color == green ? black : green;
    this.setState({ color: newColor })
  }
  
  Logout=()=>{
    fetch('https://ux2backend.herokuapp.com/api.php?action=logout', 
    {
        method: 'GET',
        credentials: 'include'
    })
    .then((headers) =>{
        if(headers.status != 200) {
            console.log('logout failed Server-Side, but make client login again');
        }
        else{
        localStorage.removeItem('csrf');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        localStorage.removeItem('phone');
        localStorage.removeItem('postcode');
        localStorage.removeItem('CustomerID');    
        alert("logout already");}
        
    })
    .catch(function(error) {console.log(error)});
  }
  render() {

    return (
      <div style={{background: this.state.color}}>
      <HashRouter>
      <div class="container">
        <h1 >Freshly Login</h1>
        <ul id="header" class="row">
          <li><NavLink to="/" class="col">Login</NavLink></li>
          <li><NavLink to="/Home" class="col ">Order</NavLink></li>
          <li><NavLink to="/contact" class="col ">Contact</NavLink></li>
          <li><NavLink to="/Setting" class="col ">Setting</NavLink></li>
          <li><NavLink to="/" class="col" onClick={this.Logout}>Logout</NavLink></li>
          <li class="col "> <button id="dark" class="btn btn-light" onClick={this.changeColor}>Darkmode</button></li>
        </ul>
        <div id="content">
           <Route exact path="/" component={Login}/>
           <Route exact path="/Home" component={Home}/>
           <Route path="/Sign" component={Sign}/>
           <Route path="/contact" component={Contact}/>
           <Route path="/Setting" component={Setting}/>
           <Route path="/password" component={password}/>
           <Route path="/payment" component={payment}/>
        </div>
        </div>
        
        </HashRouter>
        </div>
    );
  }
}

class Home extends React.Component {
  
  constructor(props) {
    super(props);
    this.completeorder = this.completeorder.bind(this);
    this.fetchorderdelete = this.fetchorderdelete.bind(this);
  
    this.state = {
      hits: [],
      redirect: false,
      order:[]
    };
  }
  fetchorderdelete= (dd)=>{
    console.log(dd);
    const fd = new FormData();
    fd.append('orderitem_ID', dd);
    console.log(fd);
   fetch('https://ux2backend.herokuapp.com/api.php?action=orderdelete', 
   {
       method: 'POST',
       body: fd,
       credentials: 'include'
   })
   .then(function(headers) {
       if(headers.status == 400) {
           console.log('can not delete');
           return;
       }
    
       if(headers.status == 201) {
           console.log('delete succussful');
           window.location.reload();
           return;
       }
   })
   .catch(function(error) {console.log(error)});
     }
  completeorder=()=>{
    fetch('https://ux2backend.herokuapp.com/api.php?action=sumtotalprice', 
    {
        method: 'GET',
        credentials: 'include'
    })
   .then((headers) =>{
        if(headers.status == 403) {
            console.log('fail to sum ');
            return;
        }
     
        if(headers.status == 201) {
            console.log('sumtotalprice');
            this.setState({ redirect: true });
            return;
        }
    })
    .catch(function(error) {console.log(error)});
     }
  componentDidMount() {
    $(document).ready(()=>{
      $("#orderform").on('click', '.btnSelect', function() {
        var currentRow = $(this).closest("tr");
        var col1 = currentRow.find(".fd-value").val(); 
        var col2 = currentRow.find(".fd-id").html(); 
        var col3 = currentRow.find(".fd-name").html(); 
        var col4 = currentRow.find(".price").html();
        var col5 =col4 * col1;
        if(col1 !=0){
        var fd = new FormData();
        fd.append('F_ID',col2 );
        fd.append('foodname', col3 );
        fd.append('price', col4 );
        fd.append('quantity', col1 );
        fd.append('totalprice', col5 );
        fetch('https://ux2backend.herokuapp.com/api.php?action=orderquantity', 

        
        {
            method: 'POST',
            body: fd,
            credentials: 'include'
        })
       .then(function(headers) {
            if(headers.status == 400) {
                console.log('fail to add');
                return;
            }
            if(headers.status == 201) {
                console.log('addfood succussful');
              //  window.location.reload();
                return;
            }
        })
        .catch(function(error) {console.log(error)});}
        else{
            alert("please select value");
        }
      });
  });
    fetch('https://ux2backend.herokuapp.com/api.php?action=displayorderfood',
    {
            method: 'POST',
            credentials: 'include'
        }
        )   .then(response => response.json())
        .then(data => this.setState({ hits: data }));
    fetch('https://ux2backend.herokuapp.com/api.php?action=showorderform',
        {
                method: 'GET',
                credentials: 'include'
            }
            )   .then(response => response.json())
            .then(data => this.setState({ order: data }));
    }

  render(){
    const { hits } = this.state; 
    const { order } = this.state; 
    const { redirect } = this.state;
     if (redirect) {
       return <Redirect to='/payment' />
     }
          return (
            <body>
            <form>
            <table>
            <thead>
                <th>Name</th>
                <th>image</th>
                <th>Price</th>
                <th>Quantity</th>
            </thead>
            <tbody id="orderform">
                  {hits.map(hit =>( 
                 <tr>
            <td hidden class='fd-id'>{hit.F_ID}</td>
            <td class='fd-name'>{hit.foodname}</td>
            <td ><img src={require(`./images/${hit.image}.jpg`).default}></img></td>
            <td class='price'>{hit.price}</td>
            <td><input type="number" class="fd-value" name="quantity" min="0" max="50"></input></td>
            <td>{hit.options}</td>
            <td><input type="submit" name="submit" class="btnSelect"></input></td>
             </tr>
                  ) )}
            </tbody>
        </table>
        </form>
        <form  >
           <h1>Your order</h1>
        <table>
            <thead>
                <th>Name</th>
                <th>Price</th>
                <th>Value</th>
                <th>totalprice</th>
            </thead>
            <tbody class="showtbody" id="showorderform">
            {order.map(response =>(
                   <tr>
                   <td class='fd-name'>{response.foodname}</td>
                   <td class='price'>{response.price}</td>
                   <td>{response.quantity}</td>
                   <td >{response.totalprice}</td>
                   <td><input type="submit" name="delete" value="delete"  onClick={() =>this.fetchorderdelete(`${response.orderitem_ID}`)}></input></td>
                   </tr>    ) )}
            </tbody>
        </table>
        <input type="submit" name="submit" value="Complete order" onClick={()=>this.completeorder()}></input>
       </form>
        </body>
          );
  }
}
class Login extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      redirect: false
    };
    
  }
  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    fetch('https://ux2backend.herokuapp.com/api.php?action=login', {
      method: 'POST',
      credentials: 'include',
      body: data
      
    }) .then((headers)=> {
      if(headers.status == 401) {
          console.log('login failed');
          localStorage.removeItem('csrf');
          localStorage.removeItem('username');
          localStorage.removeItem('phone');
          localStorage.removeItem('email');
          localStorage.removeItem('postcode');
          localStorage.removeItem('CustomerID');

          alert('Can not login')
          return;
      }
      if(headers.status == 203) {
          console.log('registration required');
          // only need csrf
      }
      if(headers.status == 200) {
        console.log('login successful');
        this.setState({ redirect: true });
        fetch('https://ux2backend.herokuapp.com/api.php?action=createorder', 
        {
            method: 'POST',
            credentials: 'include'
        })
        .then(function(headers) {
            if(headers.status == 400) {
                console.log('can not order you are not loggedin');
                return;
            }
         
            if(headers.status == 201) {
                console.log('going to order');
                alert('start order');
                return;
            }
           
        })
        .catch(function(error) {console.log(error)});

        // only need csrf
    }

  
  })
  .catch(function(error) {
      console.log(error)
  });
  }
  render() {
    const { redirect } = this.state;
    // const { redirectToReferrer } = this.state;
     if (redirect) {
       return <Redirect to='/Home'/>
     }
    return (
      <div>
        <h2>Login</h2>
        <form  onSubmit={this.handleSubmit}>
              <h4> username</h4>
              <input type="text" name="username" placeholder="user name" id="loginuser" value="username" onchange="getuserid()" required></input>
              <h4> password</h4>
              <input type="password" name="password" placeholder="password" id="loginpass" value="password" required></input>
              <input type="submit" name="submit"></input>
            
       </form>
        <button>
        <NavLink to="/Sign" id="Signup">Sign Up</NavLink>
       </button>
      </div>

    );
  }
}


class Sign extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      value: '',
      redirect: false
    };
    
  }
  onChange(evt) {
    this.setState({
      value: evt.target.value.replace(/[^a-zA-Z]/g, '')
    });
 };
 
  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    fetch('https://ux2backend.herokuapp.com/api.php?action=register', {
      method: 'POST',
      credentials: 'include',
      body: data
      
    })   .then((headers) =>{
      if(headers.status == 418) {
          console.log('user exists');
          //this.setState({ redirectToReferrer: false});
          alert("username exists");
          return;
      }
   
      if(headers.status == 201) {
          console.log('registration updated');
          this.setState({ redirect: true });
          return;
      }
     
  })
  .catch(function(error) {console.log(error)});
  }
  render() {
    const { redirect } = this.state;
   // const { redirectToReferrer } = this.state;
    if (redirect) {
      return <Redirect to='/' />
    }
    return (
      <div>
         <h1>Sign Up</h1>
         <form  onSubmit={this.handleSubmit}>
              <h4> username</h4>
             <input type="text" name="username" onChange={this.onChange.bind(this)} value={this.state.value} id="regusername" required></input>
             <h4> email</h4>
              <input type="email" name="email"  id="regemail" value="username@usee" required></input>
              <h4> phone</h4>
              <input type="text" name="phone"  id="regphone" value="11666661" required></input>
              <h4> postcode</h4>
              <input type="number" name="postcode"  id="regpostcode" value="1010" required></input>
              <h4> password</h4>
              <input type="password" name="password" placeholder="password" id="regpassword" value="password" required></input>
              <h4> confirm password</h4>
              <input type="password" name="password2" placeholder="password again" id="regpassword2" value="password" required></input>
              <input type="submit" name="submit"></input>
       </form>
      </div>
    );
  }
}

class Setting extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      value: '',
      redirect: false
    };
  }
  onChange(evt) {
    this.setState({
      value: evt.target.value.replace(/[^a-zA-Z]/g, '')
    });
 };
 
  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    this.props.history.push('/');
    fetch('https://ux2backend.herokuapp.com/api.php?action=update', {
      method: 'POST',
      credentials: 'include',
      body: data
      
    })    .then(function(headers) {
      if(headers.status == 400) {
          console.log('username exists');
          alert('update failed');
          return;
      }
   
      if(headers.status == 201) {
          console.log(' updated');
          alert('update successful');   
          this.setState({ redirect: true });
          return;
      }
     
  })
  .catch(function(error) {console.log(error)});
  }
  render() {
    const { redirect } = this.state;
   // const { redirectToReferrer } = this.state;
    if (redirect) {
      return <Redirect to='/' />
    }
    return (
      <div >
         <h1>Edit My profile</h1>
         <div>
      </div>
      <form onSubmit={this.handleSubmit}>
              <input type="hidden" name="currentusername"  id="currentusername" required hidden></input>
              <h4> username</h4>
              <input type="text" name="username"  id="upusername"  onChange={this.onChange.bind(this)} value={this.state.value} required></input>
              <h4> email</h4>
              <input type="email" name="email"  id="upemail" value="username@username2" required></input>
              <h4> phone</h4>
              <input type="number" name="phone"  id="upphone" value="1012" required></input>
              <h4> postcode</h4>
              <input type="number" name="postcode"  id="uppostcode" value="10102" required></input>
              <h4> password</h4>
              <input type="password" name="password" placeholder="password" id="uppassword" value="password2" required></input>
              <h4>re-password</h4>
              <input type="password" name="password2" placeholder="password again" id="uppassword2" value="password2" required></input>
             
              <input type="submit" name="submit"></input>
       </form>
      </div>
    );
  }
}
class password extends React.Component {
  render() {
    return (
      <div>
         <h4>New password</h4>
            <input type="password" name="password" placeholder="password"
               id="regpass"  required></input>     <br /> 
                <h4>Confirm password</h4>
              
            <input type="password" name="Confirm" placeholder="Confirm password"
               id="Confirm"  required></input>  <br />   
                <button name="subject" type="submit" id="fat-btn" class="btn btn-success" >Save</button>
        </div>

    );
  }
}

class payment extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      confirmdata: [],
      redirect: false
    };
  }
  handleSubmit(event){
    event.preventDefault();
    const data = new FormData(event.target);
    fetch('https://ux2backend.herokuapp.com/api.php?action=checkout', 
    {
        method: 'POST',
        body: data,
        credentials: 'include'
    })
    .then((headers)=> {
        if(headers.status == 401) {
            console.log('can not checkout');
            return;
        }
        if(headers.status == 201) {
          this.setState({ redirect: true });
    
            return;
        }
    })
    .catch(function(error) {console.log(error)});
    fetch('https://ux2backend.herokuapp.com/api.php?action=checkoutupdate', 
    {
        method: 'POST',
        credentials: 'include'
    })
    .then((headers)=> {
        if(headers.status == 401) {
            console.log('can not checkout');
            return;
        }
        if(headers.status == 201) {
          console.log('check out successful');
          this.setState({ redirect: true });
          alert("Check out successful")
            return;
        }
    })
    .catch(function(error) {console.log(error)});

  }
  componentDidMount(){
    fetch('https://ux2backend.herokuapp.com/api.php?action=confirmorderform',
    {
            method: 'GET',
            credentials: 'include'
        }
        )   .then(response => response.json())
        .then(data => this.setState({ confirmdata: data }));
  }
  render() {
    const { confirmdata } = this.state; 
    const { redirect } = this.state;
    // const { redirectToReferrer } = this.state;
     if (redirect) {
       return <Redirect to='/' />
     }
    return (
      <div>
      <table>
      <thead>
          <th>Ordernumber</th>
          <th>Ordertime</th>
          <th>Totalprice</th>
      </thead>
      <tbody class="orderconfirmtbody" id="confirmorderform">
      {confirmdata.map(confirmdatas =>(
                    
                    <tr>
                    <td type="text" class="orderID">{confirmdatas.orderID}</td>
                    <td type="datetime" class="ordertime">{confirmdatas.ordertime}</td>
                    <td type="number" class="totalprice">{confirmdatas.totalprice}</td>
                    </tr>
              
                     ) )}
      </tbody>
      
  </table>
  <form  onSubmit={this.handleSubmit}>
        <h3>Payment</h3>
        <label for="fname">Accepted Cards</label>
        <label for="cname">Name</label>
        <input type="text" id="cname" name="cname" value="gggggg"></input>
        <label for="ccnum">Credit card number</label>
        <input type="text" id="ccnum" name="ccnum" value="1111222233"></input>
        <label for="expmonth">Exp Month</label>
        <input type="text" id="expmonth" name="expmonth" value="April"></input>
            <label for="expyear">Exp Year</label>
            <input type="text" id="expyear" name="expyear" value="2021"></input>
            <label for="cvv">CVV</label>
            <input type="text" id="cvv" name="cvv"max="3" value="333"></input>
        <input type="submit" name="submit" id="checkoutupdate"></input>
  </form>
  </div>
    );
  }
}
class Contact extends React.Component {
  render() {
    return (
      <div>
        <h2>Contact Method</h2>
        <p>e-mail:xxxx@gmial.com</p>
        <p>Phone Number: xxx-xxx-xxx</p>
        <p>Address: 10 shhh street Brisbane,QLD</p>
      </div>
    );
  }
}
ReactDOM.render(
 <BrowserRouter><Main/></BrowserRouter>, 
  document.getElementById('root')
);
 
export default Main;