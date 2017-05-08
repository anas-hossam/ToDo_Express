var express = require('express');
var router = express.Router();
var mongoose = require('mongoose'), Schema = mongoose.Schema;
mongoose.createConnection('mongodb://localhost/todo_express');

var personSchema = Schema({
  _id     : Number,
  email    : String,
  password     : String,
  todos : [{ type: Schema.Types.ObjectId, ref: 'Todo' }]
});

var todoSchema = Schema({
  _creator : { type: Number, ref: 'Person' },
  title    : String,
  done     : Boolean
});

var Todo  = mongoose.model('Todo', todoSchema);
var Person = mongoose.model('Person', personSchema);


/* GET home page. */
router.get('/', function(req, res, next) {
    var person = req.session.person;
    console.log("signed as >> "+person)
    todos =[1,2,3,4,5]

    Todo.find({}, function (err, todos) {
  // docs.forEach
  console.log(todos) 
  res.render('todolists/index', {todos,title:'ToDo'});
});

});

router.route("/new").get(function(req, res, next) {
    person = req.session.person;
  res.render('todolists/new',{person, title:'Add ToDo'})
}).post(function(req, res, next) {
  console.log(req.body);
  let flag= false;

   // add ToDo to db
  let person = req.session.person;

person.save(function (err) {
  if (err) return handleError(err);
  
  var story1 = new Story({
    title: req.body["title"],
    _creator: person._id    // assign the _id from the person
  });
  
  story1.save(function (err) {
    if (err) {
          console.log(err);
        res.redirect('/todolists/new');
    }else{
    // thats it!
         console.log('user added succesfully');
        res.redirect('/todolists');
    }
  });
});

// var newTodo = new Todo({_creator:req.body["_id"], title:req.body["title"], done:false});

// newUser.save(function (err) {
//   if (err) {
//     console.log(err);
//     res.redirect('/todolists/new');
//   } else {
//     console.log('user added succesfully');
//     res.redirect('/todolists');
//   }
// });
});

module.exports = router;