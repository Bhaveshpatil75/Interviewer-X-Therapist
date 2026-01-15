import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, level = 'INFO' } = body;
        const timestamp = new Date().toISOString();

        // Print to server terminal
        const color = level === 'ERROR' ? '\x1b[31m' : '\x1b[36m'; // Red or Cyan
        console.log(`${color}[CLIENT-LOG] ${timestamp} [${level}]: ${message}\x1b[0m`);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
