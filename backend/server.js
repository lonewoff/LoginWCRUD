const express = require("express");
const mysql2 = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

require("dotenv").config();


const app = express();
app.use(express.json());
app.use(cors());

const db = mysql2.createPool({
    host: "localhost",
    user: "root",
    password: "", 
    database: "user_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


db.getConnection((err) => {
    if (err) {
        console.log("Database Connection Failed", err);
    } else {
        console.log("Connected to MySQL database");
    }
});

//register

app.post("/register", async (req, res) => {
    const{ username, password }= req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "All fields are required"});
    }


        const hashedPassword = await bcrypt.hash(password, 10);


        const checkUserSql = "SELECT * FROM users WHERE username = ?";
        db.query(checkUserSql, [username], (err, results) => {
                if (err) return res.status(500).json({ message: "Database Error"});
       
                if (results.length > 0){
                    return res.status(400).json({ message: "Username already exist" });
                }

        const insertUserSql = "INSERT INTO users (username, password) VALUES (?, ?)";
        db.query(insertUserSql, [username, hashedPassword], (err, result) => {
                if (err) return res.status(500).json({ message: "Registration Failed" });

                res.status(201).json({ message: "User registered successfully" });
        });
    });
});


// Login User
app.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], async (err, results) => {
      if (err || results.length === 0) {
        return res.status(400).json({ message: "Invalid username or password" });
      }
  
      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid username or password" });
      }
  
      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      res.json({ message: "Login successful", token, username: user.username });
    });
  });

  
  
  
  
  
  app.use(cors());
  app.use(express.json()); //Allows parsing of JSON request bodies
  
  
  const items = [
      {id: 1, name: "Item 1"},
      {id: 2, name: "Item 2"},
      {id: 3, name: "Item 3"}, 
      {id: 4, name: "Item 4"}
  ];
  
  
  // GET: Retrieve all items 
  app.get('/api/items', (req, res) => {
      res.json(items);
  });
  
  
  // POST: Add a new item
  app.post('/api/items', (req, res) => {
      const newItem = {id: items.length +1, name: req.body.name};
      items.push(newItem);
      res.status(201).json(newItem);
  });
  
  
  // PUT: Update a new item
  app.put('/api/items/:id', (req, res) => {
      const item = items.find(i => i.id === parseInt(req.params.id));
      if (!item) return res.status(404).json({message: "Item not found"});
      item.name = req.body.name;
      res.json(item);
  
  });
  
  
  // DELETE: Delete an item
  app.delete('/api/items/:id', (req, res) => {
      const index = items.findIndex(i => i.id === parseInt(req.params.id));
      if(index === -1) return res.status(404).json({message: "Item not found"});
  
      items.splice(index, 1);
      res.json({message: "Item deleted"});
  });
  
  
  const PORT = 5000;

app.listen(5000, () => {
    console.log("Server running on port 5000");
});