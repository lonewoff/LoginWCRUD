import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
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

  const fetchItems = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/items");
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

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

  const startEdit = (id, name) => {
    setEditId(id);
    setEditText(name);
  };

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

  const cancelEdit = () => {
    setEditId(null);
    setEditText("");
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/items/${id}`);
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mt: 6 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">Hi, {user}</Typography>
          <IconButton color="primary" onClick={logout} title="Logout">
            <LogoutIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <TextField
            size="small"
            label="Add item"
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            sx={{ flex: 1 }}
          />
          <IconButton color="success" onClick={addItem} title="Add">
            <AddIcon />
          </IconButton>
        </Box>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ color: '#aaa' }}>No items</TableCell>
                </TableRow>
              )}
              {items.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    {editId === item.id ? (
                      <TextField
                        size="small"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveEdit()}
                        autoFocus
                        sx={{ width: '100%' }}
                      />
                    ) : (
                      item.name
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {editId === item.id ? (
                      <>
                        <IconButton color="success" onClick={saveEdit} title="Save"><SaveIcon /></IconButton>
                        <IconButton color="inherit" onClick={cancelEdit} title="Cancel"><CancelIcon /></IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton color="primary" onClick={() => startEdit(item.id, item.name)} title="Edit"><EditIcon /></IconButton>
                        <IconButton color="error" onClick={() => deleteItem(item.id)} title="Delete"><DeleteIcon /></IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default Dashboard;