// test-business.js
const BusinessLogic = require('./business');

// Redis (v3.x style)
const redis = require('redis');
const { promisify } = require('util');

async function testBusinessLogic() {
    console.log('🧪 Testing Business Logic...\n');

    try {
        // Generate unique values for each test run
        const uniqueId = Date.now();

        // ---------- PostgreSQL ----------
        console.log('🐘 Testing PostgreSQL...');
        const newUser = await BusinessLogic.createUser({
            name: 'Alice',
            email: `alice${uniqueId}@example.com`
        });
        console.log('✅ User created in PostgreSQL:', newUser);

        const users = await BusinessLogic.getUsers();
        console.log('📋 Users in PostgreSQL:', users);

        // ---------- MongoDB ----------
        console.log('\n🍃 Testing MongoDB...');
        const newProduct = await BusinessLogic.createProduct({
            name: `Test Product ${uniqueId}`,
            price: 19.99,
            category: 'Electronics'
        });
        console.log('✅ Product created in MongoDB:', newProduct);

        const products = await BusinessLogic.getProducts();
        console.log('📋 Products in MongoDB:', products);

        // ---------- Redis ----------
        console.log('\n🟥 Testing Redis...');
        const redisClient = redis.createClient(6379, 'localhost');
        const getAsync = promisify(redisClient.get).bind(redisClient);
        const setAsync = promisify(redisClient.set).bind(redisClient);

        redisClient.on('connect', () => {
            console.log('✅ Connected to Redis');
        });

        redisClient.on('error', (err) => {
            console.error('❌ Redis Error:', err);
        });

        await setAsync('testKey', `RedisValue-${uniqueId}`);
        const redisValue = await getAsync('testKey');
        console.log('📦 Redis SET/GET:', redisValue);

        redisClient.quit();

        // ---------- Firebase ----------
        console.log('\n🔥 Testing Firebase...');
        const newOrder = await BusinessLogic.createOrder({
            productName: `Sample Product ${uniqueId}`,
            quantity: 2,
            totalPrice: 29.99
        });
        console.log('✅ Order created in Firebase:', newOrder);

        const orders = await BusinessLogic.getOrders();
        console.log('📋 Orders in Firebase:', orders);

        // ---------- Cross-Database ----------
        console.log('\n🔄 Testing Complete Transaction...');
        const transaction = await BusinessLogic.createCompleteTransaction(
            { name: 'Bob', email: `bob${uniqueId}@example.com` }, 
            { name: `Laptop ${uniqueId}`, price: 899, category: 'Computers' }, 
            { quantity: 1, totalPrice: 899 }
        );
        console.log('✅ Complete transaction:', transaction);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testBusinessLogic();
