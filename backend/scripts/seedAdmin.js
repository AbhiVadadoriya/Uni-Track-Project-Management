import { User } from "../models/user.js";
import { connectDb, disconnectDb } from "./dbClient.js";

const adminName = process.env.ADMIN_NAME || "Project Admin";
const adminEmail = process.env.ADMIN_EMAIL || "admin@local.com";
const adminPassword = process.env.ADMIN_PASSWORD || "Admin12345";

async function run() {
  await connectDb();

  const existing = await User.findOne({ email: adminEmail });

  if (existing) {
    existing.role = "Admin";
    existing.password = adminPassword;
    await existing.save();
    console.log(`Updated admin credentials for: ${adminEmail}`);
    return;
  }

  const admin = new User({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: "Admin",
  });

  await admin.save();
  console.log(`Seeded admin user: ${adminEmail}`);
}

run()
  .catch((error) => {
    console.error("seed:admin failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDb();
  });
