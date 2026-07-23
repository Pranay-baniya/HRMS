import dns from "dns";
import mongoose from "mongoose";

if (process.env.NODE_ENV !== "production") {
  // Some local networks/VPNs configure a DNS server that refuses Node's
  // SRV lookups (used by mongodb+srv:// URIs) even though the OS resolver
  // handles them fine. Public resolvers avoid that in dev.
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const RETRY_DELAY_MS = 5000;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    console.error(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
    setTimeout(connectDB, RETRY_DELAY_MS);
  }
};

export default connectDB;
