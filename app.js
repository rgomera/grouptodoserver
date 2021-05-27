// load modules
const express = require('express');
const cors = require('cors');
const pool = require('./db');

// create express app
const app = express();

// port 
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes

// root route
app.get('/', (req, res) => {
    res.send(`Server is now listening at ${PORT}...`);
});

// login and register routes
app.use('/auth', require('./routes/jwtAuth'));

// get user route
app.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query_response = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);

        res.json({ name: query_response.rows[0].user_name });
    } catch (err) {
        console.error(err.message);
    }
});

// create todo route
app.post('/todos/create_todo/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { description, selectedcategory, visibility } = req.body;
        const sql = `INSERT INTO todo(todo_desc, todo_date, category_id, todo_remarks, todo_visibility, todo_creator) VALUES($1,CURRENT_DATE, $2, 'In Progress', $3, $4) RETURNING *`;
        const data = [description, selectedcategory, visibility, id];

        const query_response = await pool.query(sql, data);
        res.json({ message: 'Todo was created successfully' });
    } catch (err) {
        console.error(err.message);
    }
});

// get all todos
app.get('/todos', async (req, res) => {
    try {
        const query_response = await pool.query('SELECT * FROM todo');
        res.json(query_response.rows);
    } catch (err) {
        console.error(err.message);
    }
});

// get todo list from from tunction
app.get('/todo_list/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query_response = await pool.query('SELECT * FROM select_todolist($1)', [id]);
        res.json(query_response.rows);
    } catch (err) {
        console.error(err.message);
    }
});

// get all category
app.get('/categories', async (req, res) => {
    try {
        const query_response = await pool.query('SELECT * FROM category');
        res.json(query_response.rows);
    } catch (err) {
        console.error(err.message);
    }
});

// get a todo
app.get('/todos/get_todo/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = [id];

        const query_response = await pool.query('SELECT * FROM todo WHERE todo_id = $1', data);
        res.json(query_response.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

// update todo
app.put('/todos/update_todo/:tid/:uid', async (req, res) => {
    try {
        const { tid, uid } = req.params;
        const { description } = req.body;

        // check if user is the owner of the todo, else not allowed to update todo
        const isUserAllowed = await pool.query('SELECT * from todo WHERE todo_id = $1 AND todo_creator = $2', [tid, uid]);

        if (isUserAllowed.rows.length != 0) {
            const sql = 'UPDATE todo SET todo_desc = $1 WHERE todo_id = $2';
            const data = [description, tid];

            const query_response = await pool.query(sql, data);
            res.json({ message: 'Todo was updated successfully!' });
        } else {
            res.status(401).json({ message: 'Not allowed to update others todo!' });
        }
    } catch (err) {
        console.error(err.message);
        res.json();
    }
});

// update remarks route
app.put('/todos/update_remarks/:tid/:uid', async (req, res) => {
    try {
        const { tid, uid } = req.params;
        const { remarks } = req.body;

        // check if user is the owner of the todo, else not allowed to update remarks
        const isUserAllowed = await pool.query('SELECT * from todo WHERE todo_id = $1 AND todo_creator = $2', [tid, uid]);

        if (isUserAllowed.rows.length != 0) {
            const sql = 'UPDATE todo SET todo_remarks = $1 WHERE todo_id = $2 RETURNING *';
            const data = [remarks, tid];

            const query_response = await pool.query(sql, data);
            res.json({ message: 'Todo remarks was update successfully' });
        } else {
            res.status(401).json({ message: 'Not allowed to update others todo!' });
        }
    } catch (err) {
        console.error(err.message);
    }
});

// delete todo
app.delete('/todos/delete_todo/:tid/:uid', async (req, res) => {
    try {
        const { tid, uid } = req.params;
        const data = [tid];

        // check if user is the owner of the todo, else not allowed to update remarks
        const isUserAllowed = await pool.query('SELECT * from todo WHERE todo_id = $1 AND todo_creator = $2', [tid, uid]);

        if (isUserAllowed.rows.length != 0) {
            const query_response = await pool.query('DELETE FROM todo WHERE todo_id = $1', data);
            res.json({ message: 'Todo was deleted successfully!' });
        } else {
            res.status(401).json({ message: 'Not allowed to update others todo!' });
        }
    } catch (err) {
        console.error(err.message);
    }
});

app.listen(PORT, () => console.log(`server is now listening at ${PORT}...`));
