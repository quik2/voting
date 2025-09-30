import { NextResponse } from 'next/server';
import Airtable from 'airtable';

export async function GET() {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;

    // Try to get base schema using Airtable Meta API
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({
        success: false,
        error: `Meta API error: ${response.status} - ${error}`,
        baseId,
        hasApiKey: !!apiKey
      }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      tables: data.tables
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
