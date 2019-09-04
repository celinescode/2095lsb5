let express = require('express');
let app = express();

let mongodb = require('mongodb');
let MongoClient = mongodb.MongoClient;
let url = 'mongodb://localhost:27017/';
let db;
MongoClient.connect(url,{useNewUrlParser: true,useUnifiedTopology: true},function(err,client){
    if(err){
        console.log('err',err);
    }else{
        db = client.db('fit2095db');
        col = db.collection('task');
        console.log("mongodb connected")
    }
})

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(express.urlencoded({extended:false}));
app.use(express.static('img'));
app.use(express.static('css'));



var filePath = __dirname + "/views/";

app.get('/',function(req,res){
    let fileName = filePath + "index.html";
    res.sendFile(fileName);
});

app.get('/newTask',function(req,res){
    let fileName = filePath + "addNewTask.html";
    res.sendFile(fileName);
})

app.post('/addNewTask',function(req,res){
    let taskDetails = req.body;
    col.insertOne({name:taskDetails.taskName,assignName:taskDetails.assignTo,dueDate:taskDetails.taskDueDate,taskStatus:taskDetails.taskStatus,taskDescription:taskDetails.taskDescription},function(err,result){
        if(err){
            console.log('err',err);
        }else{
            res.redirect('/listTasks');
        }
    })
});



app.post('/updateTask',function(req,res){
    let taskDetails = req.body;
    let filter = {_id: new mongodb.ObjectID(taskDetails.taskID)};
    let theUpdate = { $set: { taskStatus: taskDetails.ntaskStatus} };
    db.collection('task').updateOne(filter, theUpdate);
    res.redirect('/listTasks');
})

app.get('/update',function(req,res){
    let fileName = filePath + "updateTask.html";
    res.sendFile(fileName);
})

app.get('/delete',function(req,res){
    let fileName = filePath + "deleteTask.html";
    res.sendFile(fileName);
})

app.post('/deleteTask', function (req, res) {
    let taskDetails = req.body;
    let filter = {_id: new mongodb.ObjectID(taskDetails.taskID)};
    col.deleteOne(filter, function (err, obj) {
        console.log(obj.result);
      });
    res.redirect('/listTasks');
});

app.post('/deleteAll',function(req,res){
    col.deleteMany({taskStatus:"Complete"}, function (err, obj) {
        console.log(obj.result); //The return object obj contains the number of deleted documents.
      });
      res.redirect('/listTasks');
})

app.get('/deleteOldComplete',function(req,res){
    var curDate = new Date();
    col.deleteMany({taskStatus:"Complete"},{$lt:curDate},function (err, obj) {
        console.log(obj.result);
      });
      res.redirect('/listTasks');
})

app.get('/listTasks',function(req,res){
    db.collection('task').find({}).toArray(function (err, data) {
        res.render('listTasks', { tasks: data });   
    });
});

app.post('/add',function(req,res){
    db.push(req.body);
    res.render("listTasks",{tasks: db});
});

app.listen(8080);