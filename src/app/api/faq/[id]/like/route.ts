import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import FAQ from '@/models/faq.model';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    // 1. Read the action body from the frontend request
    const { action } = await request.json();

    // 2. Decide if we add 1 or subtract 1
    const voteIncrement = action === 'dec' ? -1 : 1;

    // 3. Pass the dynamic number directly to $inc
    const updatedFAQ = await FAQ.findByIdAndUpdate(
      id,
      { $inc: { helpfulVotes: action === 'dec' ? -1 : 1 } },
      { returnDocument: 'after' } // Returns the newly modified object
    );

    if (!updatedFAQ) {
      return NextResponse.json({ error: 'FAQ entry not found' }, { status: 404 });
    }

    return NextResponse.json({ data: updatedFAQ }, { status: 200 });
  } catch (error) {
    console.error('Database patch error:', error);
    return NextResponse.json({ error: 'Failed to complete transaction' }, { status: 500 });
  }
}
