const redis = require("redis");

// Connect to Redis running in Docker
const client = redis.createClient(6379, "127.0.0.1");

client.on("connect", () => {
  console.log("✅ Connected to Redis");
});

client.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

// Test set/get
client.set("hello", "world", (err, reply) => {
  if (err) throw err;
  console.log("SET:", reply);

  client.get("hello", (err, value) => {
    if (err) throw err;
    console.log("GET:", value);
    client.quit(); // close connection
  });
});
