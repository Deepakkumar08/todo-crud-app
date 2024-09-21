import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import ReactPaginate from 'react-paginate';

const socket = io('http://localhost:3000'); // WebSocket connection to backend

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ title: '', description: '', image: null , dueDate:""});
  const [page, setPage] = useState(1);
  const [dueDate, setDueDate] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Fetch TODOs with pagination
  const fetchTodos = async (page = 1) => {
    try {
      const limit = 5;

    // const response = await axios.get(`http://localhost:3000/todos?page=${page}&limit=${limit}`);
    const response = await axios.get(`http://localhost:3000/todos`);
    console.log(response,'resssss')

    setTodos(response.data);
    setTotalPages(Math.ceil(response.data.total / limit)); // Assuming response gives total count
      
    } catch (error) {
        console.log(error,'the error is');
    }
    
  };

  useEffect(() => {
    fetchTodos();

    //WebSocket: Listen for TODO due notifications
    socket.on('todoDue', (todo) => {
      setNotifications((prev) => [...prev, `TODO "${todo.title}" is due!`]);
    });

    return () => {
      socket.off('todoDue');
    };
  }, []);

  // Handle form submission to create new TODO
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newTodo.title);
    formData.append('description', newTodo.description);
    if (newTodo.image) {
      formData.append('image', newTodo.image);
    }
    newTodo = {...newTodo, "dueDate" : dueDate}

    try {
      await axios.post('http://localhost:3000/todos', newTodo);
      setNewTodo({ title: '', description: '', image: null });
      fetchTodos(); // Refresh TODO list
    } catch (err) {
      console.error('Error creating TODO:', err);
    }
  };

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    setPage(selectedPage);
    fetchTodos(selectedPage);
  };

  return (
    <div className="App">
      <h1>TODO List</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={newTodo.title}
          onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          value={newTodo.description}
          onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNewTodo({ ...newTodo, image: e.target.files[0] })}
        />
        <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        
        <button type="submit">Add TODO</button>
      </form>

      <h2>TODO List</h2>
      <ul>
        {todos.map((todo) => (
          <li key={todo._id}>
            <h3>{todo.title}</h3>
            <p>{todo.description}</p>
            <p>{todo.dueDate}</p>
            {todo.image && <img src={`http://localhost:3000/${todo.image}`} alt={todo.title} />}
          </li>
        ))}
      </ul>

      <ReactPaginate
        previousLabel={"Previous"}
        nextLabel={"Next"}
        pageCount={totalPages}
        onPageChange={handlePageClick}
        containerClassName={"pagination"}
        activeClassName={"active"}
      />

      <h2>Notifications</h2>
      <ul>
        {notifications.map((notification, index) => (
          <li key={index}>{notification}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
