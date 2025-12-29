import Event, { IEvent } from '@/database/event.model';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

// TypeScript interface for route params
interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/events/[slug]
 * Fetches a single event by its slug
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Connect to database
    await connectDB();

    // Extract and validate slug from route params
    const { slug } = await params;

    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid slug parameter. Slug must be a non-empty string.',
        },
        { status: 400 }
      );
    }

    // Validate slug format (lowercase alphanumeric with hyphens)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Invalid slug format. Slug must contain only lowercase letters, numbers, and hyphens.',
        },
        { status: 400 }
      );
    }

    // Query event by slug
    const event: IEvent = await Event.findOne({ slug }).lean().exec();

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: `Event with slug "${slug}" not found.`,
        },
        { status: 404 }
      );
    }

    // Return success response with event data
    return NextResponse.json(
      {
        success: true,
        message: 'Event fetched successfully',
        event,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    console.error('[GET /api/events/[slug]] Error:', error);

    // Handle database connection errors specifically
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Database connection error. Please try again later.',
        },
        { status: 503 }
      );
    }

    // Handle all other unexpected errors
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred while fetching the event.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

