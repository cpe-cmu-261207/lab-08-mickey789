const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const courses = require('./myCourses');

//to post you must use bodyParser

app.use(express.static("assets"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.end(fs.readFileSync("./instruction.html"));
});

//implement your api here
//follow instruction in http://localhost:8000/

app.get("/courses", (req, res) => {
  const text = fs.readFileSync('myCourses.json','utf8');
  const data = JSON.parse(text);
  res.json({success: true, data});
})

app.get("/courses/:id", (req, res) => {
  const text = fs.readFileSync('myCourses.json','utf8');
  const source = JSON.parse(text);
  const {id} = req.params;
  const data = source.courses.find(course => course.courseId === Number(id))
  if(!data){
    res.status(404);
    res.json({success: false, data: null});
    return;
  }else{
    res.status(200);
    res.json({success: true, data});
  }
})

app.delete("/courses/:id", (req, res) =>{
  const text = fs.readFileSync('myCourses.json','utf8');
  const data = JSON.parse(text);
  let size = data.courses.length;
  const {id} = req.params;
  data.courses = data.courses.filter(date => date.courseId !== Number(id))
  if(data.courses.length < size){
    let sum = 0;
    let w = 0;
    data.courses.map(course => {
      sum += (course.gpa * course.credit);
      w += course.credit;
    })
    data.gpax = (sum/w);
    fs.writeFileSync('myCourses.json',JSON.stringify(data));

    res.status(200).json({ success: true, data: data.courses });
  }else{
    res.status(404).json({ success: false, data: data.courses });
  }
})

app.post("/addCourse",(req,res) => {
  const { courseId, courseName, credit, gpa } = req.body
  const newCourse = {
    courseId: courseId,
    courseName: courseName,
    credit: credit,
    gpa: gpa
  }
  if (courseId !== undefined && courseName !== undefined && credit !== undefined && gpa !== undefined) {
    courses.courses.push(newCourse)
    const text = fs.readFileSync('myCourses.json','utf8');
    const data = JSON.parse(text);
    let sum = 0;
    let w = 0;
    data.courses.map(course => {
      sum += (course.gpa * course.credit);
      w += course.credit;
    })
    data.gpax = (sum/w);
    fs.writeFileSync('myCourses.json',JSON.stringify(data));
    
    res.status(201).send({ success: true, data: newCourse });
  }
  else {
    res.status(422).send({ success: false, error: "ใส่ข้อมูลไม่ครบ" });
  }
  
})

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`server started on port:${port}`));