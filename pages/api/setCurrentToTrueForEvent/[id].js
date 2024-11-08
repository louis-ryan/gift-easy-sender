import dbConnect from '../../../utils/dbConnect';
import Event from '../../../models/Event';
import Account from '../../../models/Account';

dbConnect();

export default async (req, res) => {
    const { query: { id } } = req;


    try {
        const event = await Event.findById(id);

        const account = await Account.findOne({ user: event.user })

        await Account.findByIdAndUpdate(account._id, { currentEventStr: event._id }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: event, message: `Event selected set to current` });

    } catch (error) {
        res.status(400).json({ success: false, error: error });
    }





    // try {
    //     const note = await Note.findByIdAndUpdate(id, req.body, {
    //         new: true,
    //         runValidators: true
    //     });

    //     if (!note) {
    //         return res.status(400).json({ success: false });
    //     }

    //     res.status(200).json({ success: true, data: note });
    // } catch (error) {
    //     res.status(400).json({ success: false });
    // }

}