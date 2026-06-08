// src/app/api/contact/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Contact } from "@/models/Contact";
import { ContactInputSchema } from "@/lib/validation";
import { sendContactNotificationToOwner } from "@/lib/mailer";


export async function POST(request: Request) {
  try {
    // 1. Resolve database infrastructure connection
    await connectDB();
    const body = await request.json();

    // 2. Enforce structural validation rules via Zod schema rules
    const validatedFields = ContactInputSchema.safeParse(body);
    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, message: "Invalid contact form input data parameters.", errors },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validatedFields.data;

    // 3. Database Write Execution: Save copy of request records to MongoDB
    const storedSubmission = await Contact.create({
      name,
      email,
      subject,
      message,
    });

    // 4. Notification Execution: Forward form details immediately to owner inbox
    try {
      await sendContactNotificationToOwner({
        clientName: name,
        clientEmail: email,
        subjectLine: subject,
        messageText: message,
      });
    } catch (emailError) {
      // Log notification failures but do not block user confirmation loop
      console.error("❌ Nodemailer failed to deliver incoming request to owner:", emailError);
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Your message has been submitted successfully! The design studio team has been notified.",
        data: { id: storedSubmission._id.toString() }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("❌ Critical Contact Route Exception Intercepted:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error occurred while archiving contact details." },
      { status: 500 }
    );
  }
}


// Add this GET function below your existing POST method inside app/api/contact/route.ts
export async function GET() {
  try {
    await connectDB();
    const contacts = await Contact.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: contacts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to collect contact messages." }, { status: 500 });
  }
}
