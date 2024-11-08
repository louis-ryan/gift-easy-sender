import dbConnect from '../../../utils/dbConnect';
import Event from '../../../models/Event';

dbConnect();

export default async (req, res) => {
    const { query: { user } } = req;

    try {
        const event = await Event.find({ user: user });

        if (!event) {
            return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(400).json({ success: false, error: error });
    }
}