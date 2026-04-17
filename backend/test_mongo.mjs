import mongoose from 'mongoose';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGO_URI, { dbName: "myDatabase" })
  .then(async () => {
    console.log("Connected to MongoDB... Updating project status.");
    const result = await mongoose.connection.collection('projects').updateMany(
      { status: "completed" }, 
      { $set: { status: "in-progress" } }
    );
    console.log(`Updated ${result.modifiedCount} completed projects back to 'in-progress'.`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
