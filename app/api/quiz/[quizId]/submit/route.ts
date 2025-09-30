import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const { quizId } = await params;
  try {
    const { voterName, voterEmail, ratings } = await request.json();

    if (!voterName || !voterEmail || !ratings) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Get quiz data to get applicant names
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Check if this email has already submitted for this quiz
    const { data: existing } = await supabase
      .from('quiz_responses')
      .select('id')
      .eq('quiz_id', quizId)
      .eq('voter_email', voterEmail)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'You have already submitted this quiz with this email' },
        { status: 400 }
      );
    }

    // Prepare response records (only include non-null ratings)
    const responses = Object.entries(ratings)
      .filter(([_, rating]) => rating !== null)
      .map(([applicantId, rating]) => {
        const applicant = quiz.selected_applicants.find(
          (a: any) => a.id === applicantId
        );

        return {
          quiz_id: quizId,
          voter_name: voterName,
          voter_email: voterEmail,
          applicant_id: applicantId,
          applicant_name: applicant?.applicant_name || 'Unknown',
          rating: rating as number,
        };
      });

    // Insert all responses
    const { error: insertError } = await supabase
      .from('quiz_responses')
      .insert(responses);

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save responses' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Submit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
