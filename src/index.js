const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "Mensagem de erro" })
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(user => user.username == username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "Mensagem do erro" });
  }


  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, username } = request.body;

  const { user } = request;

  const updateTodo = user.todos.find(todo => todo.id === id);

  if (!updateTodo) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }

  updateTodo.title = title;
  updateTodo.username = username;


  return response.json(updateTodo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const updateTodo = user.todos.find(todo => todo.id === id);

  if (!updateTodo) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }

  updateTodo.done = true;

  return response.json(updateTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const deleteTodo = user.todos.find(todo => todo.id === id);

  if (!deleteTodo) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }

  user.todos.splice(deleteTodo, 1);

  return response.status(204).send();
});

module.exports = app;