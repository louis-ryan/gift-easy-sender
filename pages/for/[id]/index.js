import { useState, useEffect } from 'react';
import fetch from 'isomorphic-unfetch';
import { useRouter } from 'next/router';
import GiftPaymentForm from '../../../components/GiftPaymentForm';

const Note = () => {

    const [event, setEvent] = useState({})
    const [wishes, setWishes] = useState([])
    const [thisWish, setThisWish] = useState({})

    const router = useRouter()

    const eventName = router.query.id

    console.log("event name: ", eventName)

    const organizePaymentsByGift = (payments, wishes) => {

        let updatedWishes

        updatedWishes = [...wishes]

        payments.forEach(payment => {
            console.log("payment: ", payment)
            wishes.forEach((wish, idx) => {
                if (payment.giftId === wish._id) {
                    updatedWishes[idx] = { ...wish, paid: wish.paid = wish.paid + payment.amount }
                }
            })
        });

        console.log("updated wishes: ", updatedWishes)

        setWishes(updatedWishes)
    }

    const getPaymentsData = async (eventId, wishes) => {
        try {
            const res = await fetch(
                `https://wishlistsundayplatform.vercel.app/api/getStripePayments?eventId=${eventId}`,
                {
                    method: 'GET',
                    credentials: 'include',  // Important for CORS with credentials
                    headers: {
                        'Content-Type': 'application/json',
                        // No need to explicitly set Origin as browser will do this
                    }
                }
            );
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const { payments } = await res.json();
            console.log("payments json: ", payments);
            organizePaymentsByGift(payments, wishes);
        } catch (error) {
            console.error("Error fetching payments:", error);
        }
    }

    const getWishesData = async (eventId) => {
        const noteRes = await fetch(`https://wishlistsundayplatform.vercel.app/api/getNotesBy/${eventId}`);
        const { noteData } = await noteRes.json();
        const noteDataWithPaid = []
        noteData.forEach((note) => {
            noteDataWithPaid.push({ ...note, price: parseFloat(note.price), paid: 0 })
        })
        setWishes(noteDataWithPaid)
        getPaymentsData(eventId, noteDataWithPaid)
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
                    {wishes.map((wish, idx) => {
                        return (
                            <div
                                key={idx}
                                className='card'
                            >
                                <h3>{wish.title}</h3>
                                <h3>${wish.paid} of ${wish.price}</h3>
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

                {thisWish._id && event &&
                    <div className="card" style={{ width: "100%" }}>

                        <h3>{"Payment for " + thisWish.title}</h3>

                        <GiftPaymentForm
                            recipientId="acct_1QK0JABUsEMA9E3L"
                            giftAmount={10.00}
                            eventName={eventName}
                            giftId={thisWish._id}
                            eventId={event._id}
                            getPaymentsData={getPaymentsData}
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