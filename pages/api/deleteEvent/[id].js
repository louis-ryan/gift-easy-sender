import dbConnect from '../../../utils/dbConnect';
import Event from '../../../models/Event';
import Note from '../../../models/Note';
import Account from '../../../models/Account';

dbConnect();

export default async (req, res) => {
    const { query: { id } } = req;


    try {
        const event = await Event.findById(id);
        const deletedEvent = await Event.deleteOne({ _id: id });
        const deletedWishes = await Note.deleteMany({ event: id })
        if (!deletedEvent) {
            return res.status(400).json({ success: false, error: "Event not deleted." })
        }
        const eventsFromUser = await Event.find({ user: event.user })
        const idOfMostRecentEvent = eventsFromUser[eventsFromUser.length - 1]._id

        const account = await Account.findOne({ user: event.user })

        const updatedAccount = await Account.findByIdAndUpdate(account._id, { currentEventStr: idOfMostRecentEvent }, {
            new: true,
            runValidators: true
        });

        console.log("updated current event after deletion: ", updatedAccount)

        const eventToMakeCurrent = await Event.findById(idOfMostRecentEvent)

        res.status(200).json({
            success: true,
            data: eventToMakeCurrent,
            message: `You deleted the event with id: ${id} and ${deletedWishes.deletedCount} wishes`
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error })
    }

}