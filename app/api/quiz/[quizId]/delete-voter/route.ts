import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifySession } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const { quizId } = await params;
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !verifySession(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { voterEmail } = await request.json();

    if (!voterEmail) {
      return NextResponse.json(
        { error: 'Voter email required' },
        { status: 400 }
      );
    }

    // Delete all responses from this voter for this quiz
    const { error } = await supabase
      .from('quiz_responses')
      .delete()
      .eq('quiz_id', quizId)
      .eq('voter_email', voterEmail);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete voter responses' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete voter error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
