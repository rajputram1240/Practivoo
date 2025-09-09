import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    receiver: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: { type: String, default: "Title" },
    type: {
        type: String,
        required: true,
    },
    message: String,
    refId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "refModel", //dynamic
    },
    refModel: {
        type: String,
        required: true,
        enum: ["Message", "Task", "UserMessage",], //dynamic
    },
    isRead: { type: Boolean, default: false },
}, { timestamps: true }
);

export default mongoose.models.Notification ||
    mongoose.model("Notification", notificationSchema);
