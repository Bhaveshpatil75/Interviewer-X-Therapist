import mongoose from 'mongoose';

export interface IParticipant extends mongoose.Document {
    name: string;
    roomName: string;
    joinedAt: Date;
}

const ParticipantSchema = new mongoose.Schema<IParticipant>({
    name: {
        type: String,
        required: true,
    },
    roomName: {
        type: String,
        required: true,
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Participant || mongoose.model<IParticipant>('Participant', ParticipantSchema);
