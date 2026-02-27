import mongoose from 'mongoose';

export interface IInterview extends mongoose.Document {
    participantName: string;
    roomName: string;
    jobTitle?: string;
    company?: string;
    event?: string;
    joinedAt: Date;
}

const InterviewSchema = new mongoose.Schema<IInterview>({
    participantName: {
        type: String,
        required: true,
    },
    roomName: {
        type: String,
        required: true,
    },
    jobTitle: {
        type: String,
        required: false,
    },
    company: {
        type: String,
        required: false,
    },
    event: {
        type: String,
        required: false,
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Interview || mongoose.model<IInterview>('Interview', InterviewSchema);
