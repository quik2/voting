import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const { quizId } = await params;
  try {
    // Count unique voters (by email)
    const { data, error } = await supabase
      .from('quiz_responses')
      .select('voter_email')
      .eq('quiz_id', quizId);

    if (error) {
      return NextResponse.json({ count: 0 });
    }

    // Get unique voter count
    const uniqueVoters = new Set(data?.map(r => r.voter_email) || []);

    return NextResponse.json({ count: uniqueVoters.size });
  } catch (error: any) {
    return NextResponse.json({ count: 0 });
  }
}
