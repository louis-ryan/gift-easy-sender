import dbConnect from '../../../utils/dbConnect';
import Note from '../../../models/Note';

dbConnect();

export default async (req, res) => {
    const { query: { id } } = req;

    try {
        const wishes = await Note.find({ event: id });

        if (!wishes) {
            return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: wishes });
    } catch (error) {
        res.status(400).json({ success: false, error: error });
    }
}