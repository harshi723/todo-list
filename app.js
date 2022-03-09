const express = require("express");
const bodyparser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');
mongoose.connect('mongodb://127.0.0.1/todo', { useNewUrlParser: true });

 //Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const app = express();
app.set("view engine", "ejs");
app.use("/public", express.static("public"));
app.use(bodyparser.urlencoded({ extended: true }));

const itemsSchema = ({
  name: String
});
const Item = mongoose.model("Item", itemsSchema); 

const lisSchema = ({
  name: String,
  items: [itemsSchema]
});
const Lis = mongoose.model("Lis", lisSchema);

const item1 = new Item({
  name: "Buy Food"
});
const item2 = new Item({
  name: "Cook Food"
});
const item3 = new Item({
  name: "Do the dishes"
});
const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {
  let today = date.getdate();
  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        }
        else {
          console.log("Success!");
        }
      });
      res.redirect("/");
    }
    else {
      res.render("list", { title: "Today", list: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const head = req.body.button;
  const item = new Item({
    name: req.body.newItem
  });
  if (head === "Today"){
    item.save();
    res.redirect("/");
  }
  else {
    Lis.findOne({name: head}, function(err, found){
      found.items.push(item);
      found.save();
      res.redirect("/" + head);
    });
  }
});

app.post("/delete", function(req,res){
  const id = req.body.checkbox;
  const heads = req.body.heads;

  if (heads == "Today") {
    Item.findByIdAndRemove(id, function(err){
      if (!err) {
      res.redirect("/");
      }
    });
  }
  else {
    Lis.findOneAndUpdate({name: heads}, {$pull: {items: {_id: id}}}, function(err, found){
      if (!err){
        res.redirect("/" + heads);
      }
    });
  }
});

app.get("/:custom", function (req, res) {
  const lname = _.capitalize(req.params.custom);
  Lis.findOne({name: lname}, function(err, foundLis){
    if(!err){
      if (!foundLis){
        const lis = new Lis({
          name: lname,
          items: defaultItems
        });
        lis.save();
        res.redirect("/" + lname);
      }
      else {
        res.render("list", {title: foundLis.name, list: foundLis.items});
      }
    }
  });  
});

app.listen(2000, function () {
  console.log("Server started at port 2000");
});
