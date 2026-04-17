import bcrypt from "bcrypt";
// import bcrypt from "bcrypt.js"
 import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { match } from "assert";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        maxLength: [30, "Your name cannot exceed 30 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false,
        minLength: [8, "Your password must be at least 8 characters long"],
    },
    role: {
        type: String,
        default: "Student",
        enum: ["Student", "Professor", "Admin"],
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    department: {
        type: String,
        trim: true,
        default: null,
    },
    expertise: {
        type: [String],
        default: [],
    },
    maxStudents: {
        type: Number,
        default: 10,
        min: [1, "Min students must be at least 1"],
    },
    assignedStudents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        default: null,
    },
}, {
    timestamps: true,
}
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
    
});
   

userSchema.methods.generateToken = function(){
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES,
})};

userSchema.methods.comparePassword = async function (enteredpassword) {
    return await bcrypt.compare(enteredpassword, this.password);
};

userSchema.methods.hasCapacity = function () {
    if(this.role !== "Professor" ) return false;
    return this.assignedStudents.length < this.maxStudents; 
}

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
}

userSchema.pre("deleteOne", { document: true, query: false }, async function () {
    const userId = this._id;
    
    if (mongoose.models.Notification) {
        await mongoose.model('Notification').deleteMany({ user: userId });
    }
    if (mongoose.models.SupervisorRequest) {
        await mongoose.model('SupervisorRequest').deleteMany({
            $or: [{ student: userId }, { supervisor: userId }]
        });
    }
        
    if (this.role === "Student") {
        if (mongoose.models.Project) {
            const project = await mongoose.model('Project').findOne({ student: userId });
            if (project) {
                if (mongoose.models.Deadline) {
                    await mongoose.model('Deadline').deleteMany({ project: project._id });
                }
                await project.deleteOne();
            }
        }
        if (this.supervisor) {
            await mongoose.model('User').updateOne(
                { _id: this.supervisor },
                { $pull: { assignedStudents: userId } }
            );
        }
    } 
    else if (this.role === "Professor") {
        await mongoose.model('User').updateMany(
            { supervisor: userId },
            { $set: { supervisor: null } }
        );
        if (mongoose.models.Project) {
            await mongoose.model('Project').updateMany(
                { supervisor: userId },
                { $set: { supervisor: null } }
            );
        }
    }
});

export const User = mongoose.model("User", userSchema);