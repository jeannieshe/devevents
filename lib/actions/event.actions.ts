'use server';
import Event from "@/database/event.model";
import connectDB from "../mongodb";

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectDB();

        const event = await Event.findOne({ slug });

        if (!event) return [];

        const similarEvents = await Event.find({ _id: { $ne: event._id }, tags: { $in: event.tags } }).lean();

        // Serialize ObjectIds and Dates to strings for Next.js serialization
        return similarEvents.map(evt => ({
            ...evt,
            _id: evt._id.toString(),
            createdAt: evt.createdAt.toISOString(),
            updatedAt: evt.updatedAt.toISOString(),
        }));

    } catch {
        return [];
    }
}