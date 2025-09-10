// BusinessLogic.js

const { pgPool, mongoose, firestore } = require('./persistence');

class BusinessLogic {
    // ---------- PostgreSQL operations ----------
    static async createUser(userData) {
        const { name, email } = userData;
        const query = 'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *';
        const result = await pgPool.query(query, [name, email]);
        return result.rows[0];
    }

    static async getUsers() {
        const query = 'SELECT * FROM users';
        const result = await pgPool.query(query);
        return result.rows;
    }

    // ---------- MongoDB operations ----------
    static async createProduct(productData) {
        const Product = mongoose.model('Product', {
            name: String,
            price: Number,
            category: String,
            createdAt: { type: Date, default: Date.now }
        });
        
        const product = new Product(productData);
        return await product.save();
    }

    static async getProducts() {
        const Product = mongoose.model('Product');
        return await Product.find({});
    }

    // ---------- Firebase operations ----------
    static async createOrder(orderData) {
        const orderRef = firestore.collection('orders').doc();
        await orderRef.set({
            ...orderData,
            createdAt: new Date(),
            status: 'pending'
        });
        return { id: orderRef.id, ...orderData };
    }

    static async getOrders() {
        const snapshot = await firestore.collection('orders').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // ---------- Cross-database operation ----------
    static async createCompleteTransaction(userData, productData, orderData) {
        try {
            // Create user in PostgreSQL
            const user = await this.createUser(userData);
            
            // Create product in MongoDB
            const product = await this.createProduct(productData);
            
            // Create order in Firebase with references
            const order = await this.createOrder({
                ...orderData,
                userId: user.id,
                productId: product._id.toString()
            });

            return {
                user,
                product,
                order,
                success: true
            };
        } catch (error) {
            throw new Error(`Transaction failed: ${error.message}`);
        }
    }
}

module.exports = BusinessLogic;
