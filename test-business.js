// test-business.js
const BusinessLogic = require("./business");

(async () => {
  try {
    // --- Redis Test ---
    await BusinessLogic.cacheSet("foo", "bar");
    const value = await BusinessLogic.cacheGet("foo");
    console.log("🔑 Redis -> foo:", value);

    // --- PostgreSQL Test ---
    const user = await BusinessLogic.createUser({
      name: "Test User",
      email: "test@example.com",
    });
    console.log("🐘 PostgreSQL -> Created User:", user);

    const users = await BusinessLogic.getUsers();
    console.log("🐘 PostgreSQL -> All Users:", users);

    // --- MongoDB + Elasticsearch Test ---
    const product = await BusinessLogic.createProduct({
      name: "Laptop",
      price: 1200,
      category: "Electronics",
    });
    console.log("🍃 MongoDB -> Created Product:", product);

    const products = await BusinessLogic.getProducts();
    console.log("🍃 MongoDB -> All Products:", products);

    const search = await BusinessLogic.searchProducts("Laptop");
    console.log("🔍 Elasticsearch -> Search Result:", search);

    // --- Firebase Mock Test ---
    const order = await BusinessLogic.createOrder({
      productId: product._id.toString(),
      quantity: 2,
    });
    console.log("🔥 Firebase Mock -> Created Order:", order);

    const orders = await BusinessLogic.getOrders();
    console.log("🔥 Firebase Mock -> All Orders:", orders);

    // --- Neo4j Test ---
    const friendship = await BusinessLogic.createFriendship("Test User", "System");
    console.log("🕸️ Neo4j -> Friendship:", friendship);

    const friends = await BusinessLogic.getFriends("Test User");
    console.log("🕸️ Neo4j -> Friends of Test User:", friends);

    console.log("✅ All database tests completed successfully!");
  } catch (err) {
    console.error("❌ Test failed:", err);
  }
})();
