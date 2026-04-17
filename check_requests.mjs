import mongoose from 'mongoose';
import { SupervisorRequest } from './backend/models/SupervisorRequest.js';

mongoose.connect('mongodb://127.0.0.1:27017/fyp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log("Connected to MongoDB.");
    const reqs = await SupervisorRequest.find({});
    console.log("Supervisor Requests:", JSON.stringify(reqs, null, 2));
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
