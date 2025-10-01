import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const { quizId } = await params;
  try {
    // Get all unique voters for this quiz by using DISTINCT on voter_email
    // and selecting the most recent submission per voter
    const { data: responses, error } = await supabase
      .from('quiz_responses')
      .select('voter_name, voter_email, submitted_at')
      .eq('quiz_id', quizId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ voters: [] });
    }

    if (!responses || responses.length === 0) {
      return NextResponse.json({ voters: [] });
    }

    // Get unique voters - keep the first occurrence (most recent due to ordering)
    const uniqueVotersMap = new Map<string, any>();
    responses.forEach(response => {
      if (!uniqueVotersMap.has(response.voter_email)) {
        uniqueVotersMap.set(response.voter_email, {
          voter_name: response.voter_name,
          voter_email: response.voter_email,
          submitted_at: response.submitted_at
        });
      }
    });

    const voters = Array.from(uniqueVotersMap.values());

    console.log(`Quiz ${quizId}: Found ${responses.length} total responses from ${voters.length} unique voters`);

    return NextResponse.json({ voters });
  } catch (error: any) {
    console.error('Voters fetch error:', error);
    return NextResponse.json({ voters: [] });
  }
}
