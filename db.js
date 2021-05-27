const { Pool } = require('pg');

const pool = new Pool({
    user: 'cwirusdgbkbdao',
    password: 'a8f346719ffba1fd0a9cefed5d582154a47d9e8d65fc4ffd1557e9ebdb69c350',
    host: 'ec2-3-215-57-87.compute-1.amazonaws.com',
    port: 5432,
    database: 'd7lrtlipufnbmh',
    ssl: {
        rejectUnauthorized = false
    }
});

module.exports = pool;
