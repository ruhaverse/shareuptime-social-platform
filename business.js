// business.js
const { Pool } = require('pg');
const mongoose = require('mongoose');
const redis = require('redis');
const { promisify } = require('util');
const neo4j = require('neo4j-driver');
const { Client } = require('@elastic/elasticsearch');

// ---------------- PostgreSQL ----------------
const pgPool = new Pool({
  host: 'localhost',
  port: 5433,            // your mapped port
  user: 'postgres',
  password: 'Fy@260177', // ✅ your pgAdmin password
  database: 'shareuptime'
});

// ---------------- MongoDB ----------------
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/shareuptime',
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String
});
const Product = mongoose.model('Product', productSchema);

// ---------------- Redis (v3 style) ----------------
const redisClient = redis.createClient(6379, 'localhost');
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);

async function cacheSet(key, value) {
  return await setAsync(key, value);
}
async function cacheGet(key) {
  return await getAsync(key);
}

// ---------------- Neo4j ----------------
const neo4jDriver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'password')
);
const neo4jSession = neo4jDriver.session();

// ---------------- Elasticsearch ----------------
const esClient = new Client({
  node: 'http://localhost:9200',
  auth: {
    username: 'elastic',
    password: process.env.ES_PASSWORD || 'changeme'
  }
});

async function checkElasticsearch() {
  try {
    const health = await esClient.cluster.health({});
    console.log('✅ Elasticsearch cluster status:', health.status);
  } catch (err) {
    console.error('❌ Elasticsearch not reachable:', err.message);
  }
}
checkElasticsearch();

// ---------------- Firebase (Mock Example) ----------------
let firebaseOrders = [];

// ---------------- Business Logic ----------------
class BusinessLogic {
  // ---------- PostgreSQL ----------
  static async createUser({ name, email }) {
    const result = await pgPool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    return result.rows[0];
  }

  static async getUsers() {
    const result = await pgPool.query('SELECT * FROM users');
    return result.rows;
  }

  // ---------- MongoDB ----------
  static async createProduct(data) {
    const product = new Product(data);
    const saved = await product.save();

    const { _id, ...doc } = saved.toObject();
    await BusinessLogic.indexProduct(_id.toString(), doc);

    return saved;
  }

  static async getProducts() {
    return await Product.find();
  }

  // ---------- Redis ----------
  static async cacheSet(key, value) {
    return cacheSet(key, value);
  }
  static async cacheGet(key) {
    return cacheGet(key);
  }

  // ---------- Firebase (Mock) ----------
  static async createOrder(order) {
    const newOrder = { id: Date.now(), ...order };
    firebaseOrders.push(newOrder);
    return newOrder;
  }
  static async getOrders() {
    return firebaseOrders;
  }

  // ---------- Neo4j ----------
  static async createFriendship(user1, user2) {
    const query = `
      MERGE (a:User {name: $user1})
      MERGE (b:User {name: $user2})
      MERGE (a)-[:FRIENDS_WITH]->(b)
      RETURN a, b
    `;
    const result = await neo4jSession.run(query, { user1, user2 });
    return result.records.map(r => ({
      from: r.get('a').properties.name,
      to: r.get('b').properties.name
    }));
  }
  static async getFriends(user) {
    const query = `
      MATCH (a:User {name: $user})-[:FRIENDS_WITH]->(b:User)
      RETURN b.name AS friend
    `;
    const result = await neo4jSession.run(query, { user });
    return result.records.map(r => r.get('friend'));
  }

  // ---------- Elasticsearch ----------
  static async indexProduct(id, product) {
    await esClient.index({
      index: 'products',
      id: id,
      document: product
    });
    await esClient.indices.refresh({ index: 'products' });
    return true;
  }
  static async searchProducts(query) {
    const result = await esClient.search({
      index: 'products',
      query: {
        multi_match: { query, fields: ['name', 'category'] }
      }
    });
    return result.hits.hits.map(hit => ({
      id: hit._id,
      ...hit._source
    }));
  }

  // ---------- Cross-Database Transaction ----------
  static async createCompleteTransaction(userData, productData, orderData) {
    const user = await this.createUser(userData);
    const product = await this.createProduct(productData);
    const order = await this.createOrder({
      ...orderData,
      productName: product.name
    });

    await this.createFriendship(user.name, 'System');
    return { user, product, order };
  }
}

module.exports = BusinessLogic;
