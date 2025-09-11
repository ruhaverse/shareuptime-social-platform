const BusinessLogic = require('./business');

// Mock data for testing
const mockUsers = [
    { name: 'Ali Veli', email: 'ali@example.com' },
    { name: 'Ayşe Fatma', email: 'ayse@example.com' }
];

const mockProducts = [
    { name: 'Laptop', price: 15000, category: 'Electronics' },
    { name: 'Kitap', price: 50, category: 'Books' },
    { name: 'Kahve', price: 25, category: 'Food' }
];

async function setupLocalDemo() {
    console.log('🚀 ShareUptime Local Demo Setup\n');

    try {
        // Test Firebase operations with mock
        console.log('📦 Testing Firebase (Mock) Operations:');
        
        for (let i = 0; i < 3; i++) {
            const orderData = {
                productName: mockProducts[i].name,
                quantity: Math.floor(Math.random() * 5) + 1,
                totalPrice: mockProducts[i].price * (Math.floor(Math.random() * 5) + 1),
                customerEmail: mockUsers[i % 2].email
            };
            
            const order = await BusinessLogic.createOrder(orderData);
            console.log(`✅ Order ${i + 1} created:`, {
                product: order.productName,
                quantity: order.quantity,
                total: order.totalPrice + ' TL'
            });
        }

        const allOrders = await BusinessLogic.getOrders();
        console.log(`\n📊 Total orders in system: ${allOrders.length}`);

        console.log('\n🎯 Demo completed successfully!');
        console.log('\n📝 Next Steps for Full Setup:');
        console.log('1. Install PostgreSQL locally or use Docker');
        console.log('2. Set up local MongoDB or use Docker');
        console.log('3. Configure real Firebase credentials');
        console.log('4. Run: docker-compose up -d (recommended)');
        
    } catch (error) {
        console.error('❌ Demo failed:', error.message);
    }
}

// Run the demo
setupLocalDemo();
