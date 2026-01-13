import mongoose from 'mongoose';

export interface IFeedback extends mongoose.Document {
    name: string;
    message: string;
    createdAt: Date;
}

const FeedbackSchema = new mongoose.Schema<IFeedback>({
    name: {
        type: String,
        required: [true, 'Please provide a name.'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    message: {
        type: String,
        required: [true, 'Please provide a message.'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);
