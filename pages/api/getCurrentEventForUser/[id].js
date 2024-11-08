import dbConnect from '../../../utils/dbConnect';
import Event from '../../../models/Event';

dbConnect();

export default async (req, res) => {

    const { query: { id } } = req;

    try {
        const event = await Event.findById(id);

        if (!event) {
            return res.status(400).json({ success: false, error: 'This user has no events.' });
        }

        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(400).json({ success: false, error: error });
    }
}