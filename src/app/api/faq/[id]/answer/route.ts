import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import FAQ from '@/models/faq.model';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } =await params ;
    const { answer } = await request.json();

    if (!answer?.trim()) {
      return NextResponse.json({ error: 'Answer content is required' }, { status: 400 });
    }

    const updatedFAQ = await FAQ.findByIdAndUpdate(
      id,
      { answer, isPublished: true },
      { returnDocument: 'after' }
    );

    if (!updatedFAQ) {
      return NextResponse.json({ error: 'FAQ entry not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'FAQ published successfully!', data: updatedFAQ }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save owner response' }, { status: 500 });
  }
}
