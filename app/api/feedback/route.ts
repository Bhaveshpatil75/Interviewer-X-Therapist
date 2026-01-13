import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Feedback from '@/lib/models/Feedback';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { name, message } = body;

        if (!name || !message) {
            return NextResponse.json({ success: false, error: 'Name and message are required' }, { status: 400 });
        }

        const feedback = await Feedback.create({ name, message });
        return NextResponse.json({ success: true, data: feedback }, { status: 201 });
    } catch (error: any) {
        console.error('Error saving feedback:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
