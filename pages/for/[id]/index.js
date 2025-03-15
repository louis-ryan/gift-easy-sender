import { useState, useEffect } from 'react';
import fetch from 'isomorphic-unfetch';
import { useRouter } from 'next/router';
import PersonalForm from '../../../components/PersonalForm';
import GiftPaymentForm from '../../../components/GiftPaymentForm';

const Note = () => {

    const [recipient, setRecipient] = useState({})
    const [event, setEvent] = useState({})
    const [wishes, setWishes] = useState([])
    const [thisWish, setThisWish] = useState({})
    const [expandedView, setExpandedView] = useState('PERSONAL')
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        amount: ''
    });

    const router = useRouter()
    const eventName = router.query.id

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

        setWishes(updatedWishes)
    }

    const getPaymentsData = async (eventId, wishes) => {
        try {
            const res = await fetch(
                `https://wishlistagogo.vercel.app/api/getStripePayments?eventId=${eventId}`,
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
            organizePaymentsByGift(payments, wishes);
        } catch (error) {
            console.error("Error fetching payments:", error);
        }
    }

    const getRecipientAccount = async (sub) => {
        try {
            const recipientRes = await fetch(`https://wishlistagogo.vercel.app/api/getAccountForThisUser/${sub}||"`);
            const { data } = await recipientRes.json();
            setRecipient(data)
        } catch (error) {
            console.error("Error getting recipient account id:", error);
        }
    }

    const getWishesData = async (eventId) => {
        const noteRes = await fetch(`https://wishlistagogo.vercel.app/api/getNotesBy/${eventId}`);
        const { noteData } = await noteRes.json();
        const noteDataWithPaid = []
        noteData.forEach((note) => {
            noteDataWithPaid.push({ ...note, price: parseFloat(note.price), paid: 0 })
        })
        setWishes(noteDataWithPaid)
        getPaymentsData(eventId, noteDataWithPaid)
    }

    const getEventData = async (eventName) => {
        const eventRes = await fetch(`https://wishlistagogo.vercel.app/api/getEventBy/${eventName}`);
        const { eventData } = await eventRes.json();
        setEvent(eventData)
        getRecipientAccount(eventData.user)
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
                <h1>{event.name}</h1>
                <h3>{event.description}</h3>
                {!thisWish._id &&
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
                }

                {thisWish._id && event &&
                    <div className="card" style={{ width: "100%" }}>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3>{"Payment for " + thisWish.title}</h3>

                            <button
                                onClick={() => { setThisWish({}); setExpandedView('PERSONAL') }}
                            >
                                {"X"}
                            </button>
                        </div>

                        {expandedView === 'PERSONAL' &&
                            <PersonalForm
                                formData={formData}
                                setFormData={setFormData}
                                setExpandedView={setExpandedView}
                            />
                        }

                        {expandedView === 'PAYMENT' &&
                            <GiftPaymentForm
                                recipientId={recipient.stripeAccountId}
                                giftAmount={formData.amount}
                                eventName={eventName}
                                giftId={thisWish._id}
                                eventId={event._id}
                                getPaymentsData={getPaymentsData}
                                senderName={formData.name}
                                description={formData.description}
                            />
                        }

                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <div
                                style={{ height: "16px", width: "16px", backgroundColor: expandedView === 'PERSONAL' ? "grey" : "lightgrey" }}
                                onClick={() => setExpandedView('PERSONAL')}
                            />
                            <div className="gaphor" />
                            <div
                                style={{ height: "16px", width: "16px", backgroundColor: expandedView === 'PAYMENT' ? "grey" : "lightgrey" }}
                                onClick={() => setExpandedView('PAYMENT')}
                            />
                        </div>
                    </div>
                }
            </div>
        </div>

    )
}

export default Note;