import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const { quizId } = await params;
  try {
    // First, get count to understand scale
    const { count, error: countError } = await supabase
      .from('quiz_responses')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', quizId);

    console.log(`Quiz ${quizId}: Total responses in DB: ${count}`);

    // Fetch ALL responses by using a very large limit parameter
    const { data: responses, error } = await supabase
      .from('quiz_responses')
      .select('voter_name, voter_email, submitted_at')
      .eq('quiz_id', quizId)
      .order('submitted_at', { ascending: false })
      .limit(10000); // Use limit instead of range

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ voters: [] });
    }

    console.log(`Quiz ${quizId}: Fetched ${responses?.length || 0} responses from API`);

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
