import mongoose from "mongoose";

const messengerSchema = mongoose.Schema({
    message:String,
    name: String,
    time: String,
    received: Boolean,
})

export default mongoose.model("appContent", messengerSchema)