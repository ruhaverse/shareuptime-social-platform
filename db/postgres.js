const {Pool} = require('pg');
const pgPool = new Pool({
    user:'postgres',
    host:'localhost',
    database:'shareuptime',
    password:'Fy@260177',
    port:5432
})

module.exports = { pgPool };