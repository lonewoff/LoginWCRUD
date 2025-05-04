import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, TextField, List, ListItem, Box, Paper } from "@mui/material";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setUser(storedUser);
    } else {
      navigate("/login");
    }
    fetchItems();
  }, [navigate]);

  // Fetch items from backend
  const fetchItems = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/items");
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  // Add a new item
  const addItem = async () => {
    if (!newItem.trim()) return;
    try {
      const response = await axios.post("http://localhost:5000/api/items", { name: newItem });
      setItems([...items, response.data]);
      setNewItem("");
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  // Start Editing
  const startEdit = (id, name) => {
    setEditId(id);
    setEditText(name);
  };

  // Save Edited Item
  const saveEdit = async () => {
    if (!editText.trim()) return;
    try {
      await axios.put(`http://localhost:5000/api/items/${editId}`, { name: editText });
      setItems(items.map(item => (item.id === editId ? { ...item, name: editText } : item)));
      setEditId(null);
      setEditText("");
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  // Delete Item
  const deleteItem = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;
    try {
      await axios.delete(`http://localhost:5000/api/items/${id}`);
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <Container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 4,
          width: "100%",
          maxWidth: "500px",
          textAlign: "center",
          borderRadius: 3,
          bgcolor: "#fff5ed", // Light blue background color
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
       
        <Typography variant="h4" sx={{ mb: 1, color: "#384358", fontWeight: "bold", fontFamily: "Calibri"}}>Welcome, {user}</Typography>
        <Typography variant="h5" sx={{ mb: 3, color: "#384358", fontFamily: "Calibri",  }}>Dashboard</Typography>

        {/* Add Item Input & Button Side-by-Side */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%", maxWidth: "400px" }}>
          <TextField
            label="New Item"
            variant="outlined"
            fullWidth
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={addItem}>
            Add
          </Button>
        </Box>

        {/* Item List */}
        <List sx={{ width: "100%", maxWidth: "400px", mt: 3 }}>
          {items.map((item) => (
            <ListItem
              key={item.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 1,
                bgcolor: "#ffecfd", // Light blue background for list items
                borderRadius: 2,
                p: 1,
                mb: 1,
              }}
            >
              {editId === item.id ? (
                <>
                  <TextField
                    fullWidth
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <Button variant="contained" color="success" onClick={saveEdit}>
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Typography sx={{ flexGrow: 1, color: "#0d47a1" }}>{item.name}</Typography>
                  <Button variant="contained" color="warning" onClick={() => startEdit(item.id, item.name)}>
                    Edit
                  </Button>
                  <Button variant="contained" color="error" onClick={() => deleteItem(item.id)}>
                    Delete
                  </Button>
                </>
              )}
            </ListItem>
          ))}
        </List>

        {/* Logout Button */}
        <Button variant="contained" color="info" onClick={logout} sx={{ mt: 3 }}>
          Logout
        </Button>        
      </Paper>
    </Container>
  );
};

export default Dashboard;