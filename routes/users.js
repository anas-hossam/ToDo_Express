var express = require('express');
var mongoose = require('mongoose'), Schema = mongoose.Schema;
var id = mongoose.Types.ObjectId();
var sId;
mongoose.connect('mongodb://localhost/blog_express');

var personSchema = Schema({
  email    : String,
  password     : String,
  todos : [{ type: Schema.Types.ObjectId, ref: 'Todo' }]
});

var todoSchema = Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'User' },
  title    : String,
  done     : Boolean
});

 var Todo  = mongoose.model('Todo', todoSchema);
// var User = mongoose.model('User', {email:String, password:String, todos : [{ type: Schema.Types.ObjectId, ref: 'Todo' }]});
var User = mongoose.model('User', personSchema);
var router = express.Router();

////////////////////////////////////// except for middleware isLoggedIn //////////////////////
router.route("/new").get(function(req, res, next) {
  res.render('users/new',{title:'SignUp'})
}).post(function(req, res, next) {
  console.log(req.body);
  // let flag= false;

   // add user to db

var newUser = new User(req.body);
console.log(newUser)



newUser.save(function (err) {
  if (err) {
    handleError(err)
    console.log("Error "+err);
    res.redirect('/users/new');
  } else {
    console.log('user added succesfully');
    res.redirect('/users');
  }
});
});

// middleware for remember me
function isRemember(req,res,next){
  console.log(req.cookies);
  if(req.cookies['email'] !== undefined){
     let email = req.cookies["email"]
    // get user by email
    User.findOne({'email':email},function(err,person){
       // set session
    req.session.person=person;
    req.session.isLogged = true;
    // redirect to todolists
    res.redirect('/users/'+person._id+'/todolists/');
    })
  }else
  next()
}

router.get("/login",isRemember,function(req, res, next){
  res.render('users/login',{title:'SignIn'})
});
router.route("/login").post(function(req, res, next){
  console.log(req.body);

  // check users credientils
  User.findOne({ 'email': req.body["email"] }, function (err, person) {
  if (err) return handleError(err);
  
  if(person != null){
    console.log('%s %s .', person.email, person.password) // Space Ghost is a talk show host.
  if(person.password == req.body["password"] ){
    console.log("logged in successuflly");
     // set cookie
    if(req.body["remember"] == 'on'){

      res.cookie('email',req.body["email"] , {
      maxAge: 86400 * 1000, // 24 hours
      httpOnly: true // http only, prevents JavaScript cookie access
});
    }
    // set session
    req.session.person=person;
    req.session.isLogged = true;
    sId=person._id;
    req.session.id= person._id
    console.log(req.session.person)
    
   
    res.redirect('/users/'+person._id+'/todolists/');
  }else{
    console.log("Incorrect password ");
    res.redirect('/users/new');
  }
  }else{
    console.log("Incorrect email");
    res.redirect('/users/new');
  }
})
  
})
/* GET todolists */
router.get('/todolists', function(req, res, next) {
   
let person = req.session.person;
    Todo.find({}).populate('_creator').exec( function (err, todos) {
  // docs.forEach
  console.log(todos) 
  res.render('todolists/all', {todos, person, title:'ToDo Lists'});
});

});
///////////////////////////////////// end of except routes /////////////////////////////

function isLoggedIn(req,res,next){
  if(req.session.person == null){

    res.redirect("/users/login")
  }else{
     next();
  }
}
router.use(isLoggedIn);
/* GET users listing. */
router.get('/', function(req, res, next) {
  let person = req.session.person;
  // get all users from db

User.find({}, function (err, users) {
  // docs.forEach
  console.log(users) 
  res.render('users/index', {person, users,title:'Users'});
});
  
});


// logout user
router.route("/logout").get(function(req, res, next){
  res.clearCookie('email');
//       res.cookie('email',req.body["email"] , {
//       maxAge: 0,
//       httpOnly: true // http only, prevents JavaScript cookie access
// });
//   req.session.destroy(function(err) {
//   // cannot access session here 
//   console.log("session destroyed")
  
// }) 
req.session.isLogged = false;
req.session.person = null;
 req.session.id= null;

res.redirect('/users/login')
})


/* Get todolists of user */
router.get('/:id/todolists', function(req, res, next) {
    let person = req.session.person;
    if(person != null)
    console.log("signed as >> "+person.email)
    // todos =[1,2,3,4,5]

    Todo.find({_creator:person._id}, function (err, todos) {
  // docs.forEach
  console.log(todos) 
  res.render('todolists/index', {todos, person, title:'ToDo'});
});

});

// new todo
router.route("/:id/todolists/new").get(function(req, res, next) {
  res.render('todolists/new',{title:'Add ToDO'})
}).post(function(req, res, next) {
  let person = req.session.person;
  console.log("session"+person)
  console.log(req.body);
  // let flag= false;

   // add todo to db

var newTodo = new Todo({_creator:person._id, title:req.body["title"], done:0});
console.log(newTodo)



newTodo.save(function (err) {
  if (err) {
    handleError(err)
    console.log("Error "+err);
    res.redirect('/todolists/new');
  } else {
    console.log('todo added succesfully');
     res.redirect('/users/'+person._id+'/todolists/');
  }
});
});

// edit todo 
router.route("/:userId/todolists/edit/:todoId").get(function(req, res, next) {
  res.send("edit by get")
}).post(function(req, res, next) {
  // res.send("edit by post")
  let todo_id=req.body.todoId
  let user_id=req.body.userId
  console.log("todo_id "+todo_id+" user_id "+user_id)
  Todo.findOneAndUpdate({_creator:user_id,_id:todo_id},{$set:{done:true}}, {upsert: true},function(err,todo){
    console.log(todo+" todo is done ")
    res.redirect('/users/'+todo._creator+'/todolists/');
  })

})

module.exports = router;

















 //1.to create a signed cookie you would use

     // res.cookie('email', req.body["email"], {signed: true})
     // And to access a signed cookie use the signedCookies object of req:

     // req.signedCookies['name']






   // var aaron = new User({ _id: 0, email: 'Aaron', password: '123' });

// aaron.save(function (err) {
//   if (err) return handleError(err);
  
//   var todo = new Todo({
//     title: "Once upon a timex.",
//     _creator: aaron._id    // assign the _id from the person
//   });
  
//   todo.save(function (err) {
//     if (err) return handleError(err);
//     // thats it!
//     console.log('user added succesfully');
//   });
// });