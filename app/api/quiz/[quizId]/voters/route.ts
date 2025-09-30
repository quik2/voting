import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const { quizId } = await params;
  try {
    // Get all responses for this quiz
    const { data: responses, error } = await supabase
      .from('quiz_responses')
      .select('voter_name, voter_email, submitted_at')
      .eq('quiz_id', quizId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ voters: [] });
    }

    // Get unique voters (in case someone voted multiple times before we added the check)
    const uniqueVotersMap = new Map<string, any>();
    responses?.forEach(response => {
      if (!uniqueVotersMap.has(response.voter_email)) {
        uniqueVotersMap.set(response.voter_email, response);
      }
    });

    const voters = Array.from(uniqueVotersMap.values());

    return NextResponse.json({ voters });
  } catch (error: any) {
    console.error('Voters fetch error:', error);
    return NextResponse.json({ voters: [] });
  }
}
