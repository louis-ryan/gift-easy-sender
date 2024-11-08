import dbConnect from '../../../utils/dbConnect';
import Account from '../../../models/Account';

dbConnect();

export default async (req, res) => {
    const { query: { user } } = req;

    const userSub = user.split('||')[0]
    const userEmail = user.split('||')[1]


    try {
        const account = await Account.findOne({ user: userSub });

        if (!account) {
            const newAccount = await Account.create(
                {user: userSub, email: userEmail, currentEventStr: ""}
            );

            res.status(201).json({ success: true, data: newAccount, message: "No account was found, one has been created." })
        }

        res.status(200).json({ success: true, data: account, message: "Your account has been found." });
    } catch (error) {
        res.status(400).json({ success: false });
    }


}