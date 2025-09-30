import { NextResponse } from 'next/server';
import { getApplicants } from '@/lib/airtable';

export async function GET() {
  try {
    const applicants = await getApplicants();
    return NextResponse.json({
      success: true,
      count: applicants.length,
      applicants
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
