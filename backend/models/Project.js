import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
     supervisorId:{
                type: mongoose.Schema.Types.ObjectId,
                ref:"User",
                required:true,
            },
            type:{
                type: String,
                enum:["positive", "negative", "general"],
                default:"general",
            },
            title:{
                type: String,
                required:true,
            },
            message:{
                type: String,
                required:true,
                maxlength:[1000, "Feedback message cannot exceed 1000 characters"],
            },
},{timestamps:true});

const projectSchema = new mongoose.Schema({
    student:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true, "Student ID is required"],
    },
    supervisor:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null,
    },
    title:{
        type: String,
        required:[true, "Project title is required"],
        trim:true,
        maxlength:[200, "Project title cannot exceed 200 characters"],
    },
    description:{
        type: String,
        required:[true, "Project description is required"],
        trim:true,
        maxlength:[2000, "Project description cannot exceed 2000 characters"],
    },
    status:{
        type: String,
       default:"pending",
       enum:["pending", "approved", "rejected", "completed"],
    },
    files:[
        {
            fileType:{
                type: String,
                required: true,
            },
             fileUrl:{
                type: String,
                required: true,
            },
             originalName:{
                type: String,
                required: true,
            },
             uploadedAt:{
                type: Date,
                Default: Date.now,
            },
        }
    ],
    feedback:[feedbackSchema],
    deadline:{
        type: Date,
    }

},
    {
        timestamps:true,
    }
);

// Indexing for better query performance
projectSchema.index({student:1});
projectSchema.index({supervisor:1});
projectSchema.index({status:1});

export const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);