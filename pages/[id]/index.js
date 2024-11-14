import { useState, useEffect } from 'react';
import fetch from 'isomorphic-unfetch';
import { useRouter } from 'next/router';
import GiftPaymentForm from '../../components/GiftPaymentForm';

const Note = () => {

    const [event, setEvent] = useState({})
    const [wishes, setWishes] = useState([])
    const [thisWish, setThisWish] = useState({})

    const router = useRouter()

    const eventName = router.query.id

    const getWishesData = async (eventId) => {
        const noteRes = await fetch(`https://wishlistsundayplatform.vercel.app/api/getNotesBy/${eventId}`);
        const { noteData } = await noteRes.json();
        setWishes(noteData)
    }

    const getEventData = async (eventName) => {
        const eventRes = await fetch(`https://wishlistsundayplatform.vercel.app/api/getEventBy/${eventName}`);
        const { eventData } = await eventRes.json();
        setEvent(eventData)
        getWishesData(eventData._id)
    }

    const getInitialProps = async () => {
        if (!eventName) return
        getEventData(eventName)
    }

    useEffect(() => {
        getInitialProps(eventName)
    }, [router])


    return (

        <div className="container">
            <div className="wrapper">
                <h1>{eventName}</h1>
                <h3>{event.description}</h3>
                <div className="cardspace">
                    {wishes.map((wish) => {
                        console.log("wish: ", wish)
                        console.log("event: ", event)
                        return (
                            <div
                                key={wish._id}
                                className='card'
                            >
                                <h3>{wish.title}</h3>
                                <h3>$0 of ${wish.price}</h3>
                                <div className="cardactions">
                                    <button
                                        onClick={() => { setThisWish(wish) }}
                                    >
                                        {"Contribute"}
                                    </button>
                                </div>
                            </div>
                        )

                    })}
                </div>

                {thisWish._id &&
                    <div className="card" style={{ width: "100%" }}>

                        <h3>{"Payment for " + thisWish.title}</h3>

                        <GiftPaymentForm
                            recipientId="acct_1QK0JABUsEMA9E3L"
                            giftAmount={10.00}
                        />

                        <div className='doublegapver' />

                        <button
                            onClick={() => setThisWish({})}
                        >
                            {"CLOSE"}
                        </button>

                    </div>
                }
            </div>
        </div>

    )
}

export default Note;