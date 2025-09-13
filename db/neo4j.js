// db/neo4j.js
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  'bolt://localhost:7687', // inside container use bolt://neo4j:7687
  neo4j.auth.basic('neo4j', 'password')
);

const session = driver.session();

module.exports = { driver, session };
