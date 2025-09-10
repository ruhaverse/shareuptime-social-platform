const {Pool} = require('pg');
const pgPool = new Pool({
    user:'postgres',
    host:'localhost',
    database:'mydb',
    password:'forget_28',
    port:5432
});

module.exports = { pgPool };