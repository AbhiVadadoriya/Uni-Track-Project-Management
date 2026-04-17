import { User } from "../models/user.js";
import { connectDb, disconnectDb } from "./dbClient.js";

const smokeEmailPattern = /^(stu|pro|adm|student|prof|admin)\d+@test\.com$/i;

async function run() {
  await connectDb();

  const users = await User.find({ email: smokeEmailPattern }).select("_id email role");

  if (users.length === 0) {
    console.log("No smoke-test users found.");
    return;
  }

  const ids = users.map((u) => u._id);
  const emails = users.map((u) => `${u.email} (${u.role})`);

  const result = await User.deleteMany({ _id: { $in: ids } });

  console.log(`Deleted ${result.deletedCount} smoke-test users.`);
  console.log(emails.join("\n"));
}

run()
  .catch((error) => {
    console.error("cleanup:smoke-users failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDb();
  });
