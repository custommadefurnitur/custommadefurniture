import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import FAQ from '@/models/faq.model';
import { auth } from '@/auth';

// 1. GET: Fetch all published (answered) FAQ items
export async function GET() {
  try {
    await connectDB();
    const faqs = await FAQ.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ data: faqs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}

// 2. POST: Customer submits an unanswered question entry
export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await auth();
    
    await connectDB();
    const { question } = await request.json();

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question text is required' }, { status: 400 });
    }

    const newFAQ = new FAQ({ 
      question, 
      isPublished: false,
      askedBy: session?.user?.id || null
    });
    await newFAQ.save();

    return NextResponse.json({ message: 'Submitted! Awaiting owner response.', data: newFAQ }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit question' }, { status: 500 });
  }
}
