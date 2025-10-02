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
      .select('*')
      .eq('quiz_id', quizId)
      .limit(10000); // Ensure we get all responses

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch responses' },
        { status: 500 }
      );
    }

    if (!responses || responses.length === 0) {
      return NextResponse.json({ analytics: [] });
    }

    // Calculate average scores per applicant
    const scoreMap: Record<
      string,
      { name: string; scores: number[]; total: number }
    > = {};

    responses.forEach((response: any) => {
      if (!scoreMap[response.applicant_id]) {
        scoreMap[response.applicant_id] = {
          name: response.applicant_name,
          scores: [],
          total: 0,
        };
      }
      scoreMap[response.applicant_id].scores.push(response.rating);
      scoreMap[response.applicant_id].total += response.rating;
    });

    // Calculate averages
    const analytics = Object.entries(scoreMap).map(([id, data]) => ({
      applicant_id: id,
      applicant_name: data.name,
      average_score: data.total / data.scores.length,
      total_votes: data.scores.length,
    }));

    return NextResponse.json({ analytics });
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
