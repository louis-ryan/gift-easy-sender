import dbConnect from '../../../utils/dbConnect';
import Event from '../../../models/Event';
import Account from '../../../models/Account';

dbConnect();

export default async (req, res) => {

    const { query: { user } } = req;

    try {
        const event = await Event.create(req.body);

        const account = await Account.findOne({user: user})

        const updatedAccount = await Account.findByIdAndUpdate(account._id, { currentEventStr: event._id }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: event, message: `New Event posted` });

    } catch (error) {
        res.status(400).json({ success: false, error: error });
    }
}