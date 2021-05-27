// load modules
const router = require('express').Router();
const pool = require('../db');

// register route
router.post('/register', async (req, res) => {
    try {
        // get data from body
        const { name, email, password } = req.body;

        // check if user is exist or not
        const user = await pool.query('SELECT * FROM users WHERE user_email = $1', [email]);

        // if user exist send error message
        if (user.rows.length != 0) return res.status(401).send({ message: 'User already exist', register: false });

        // create new user
        const data = [name, email, password];
        const query_response = await pool.query('INSERT INTO users(user_name, user_email, user_password) VALUES($1, $2, $3) RETURNING *', data);

        res.json(query_response.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// login route
router.post('/login', async (req, res) => {
    try {
        let validPassword = false;
        const { email, password } = req.body;

        // querty to check if user is exist or not
        const user = await pool.query('SELECT * FROM users WHERE user_email = $1', [email]);

        // check if user is existed
        if (user.rows.length === 0) return res.status(401).json({ message: `User does't exist`, login: false });
        else {
            if (user.rows[0].user_password === password) {
                validPassword = true;
                res.json({ id: user.rows[0].user_id, name: user.rows[0].user_name, login: true });
            } else {
                res.json({ message: 'Password is incorrect', login: false });
            }
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// exports router
module.exports = router;
