import { NextResponse } from 'next/server';
import { getApplicationResponses } from '@/lib/airtable';

export async function GET() {
  try {
    const applicants = await getApplicationResponses();
    return NextResponse.json({ applicants });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
