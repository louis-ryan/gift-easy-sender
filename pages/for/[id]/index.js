import { useState, useEffect } from 'react';
import fetch from 'isomorphic-unfetch';
import { useRouter } from 'next/router';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import PersonalForm from '../../../components/PersonalForm';
import GiftPaymentForm from '../../../components/GiftPaymentForm';
import CoverImage from '../../../components/CoverImage';

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
                `https://wishlistagogo.vercel.app/api/getStripePaymentsForEvent?eventId=${eventId}`,
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
                <CoverImage
                    imageUrl={event.imageUrl}
                />
                <div style={{ padding: "8px" }}>
                    <h1>{event.name}</h1>
                    <h3>{event.description}</h3>
                    {!thisWish._id &&
                        <div className="cardspace">
                            {wishes.map((wish, idx) => {
                                const paidConvert = Math.ceil(wish.paid / wish.price * wish.amount)
                                const remainingVal = wish.price - wish.paid
                                const data = [
                                    { name: "PAID", value: wish.paid, color: "#143950" },
                                    { name: "REMAINING", value: remainingVal, color: "white" }
                                ]
                                return (
                                    <div
                                        key={idx}
                                        className='card'
                                        style={{ position: "relative", overflow: "hidden" }}
                                    >

                                        {wish.noteUrl && (
                                            <img
                                                src={wish.noteUrl}
                                                alt="note image"
                                                style={{
                                                    position: "absolute",
                                                    height: "100%",
                                                    zIndex: "-1",
                                                    objectFit: "cover",
                                                    left: "50%",
                                                    top: "50%",
                                                    transform: "translate(-50%, -50%)"
                                                }}
                                            />
                                        )}

                                        <div style={{ backgroundColor: "white", padding: "16px", opacity: "0.9" }}>
                                            <h3>{wish.title}</h3>
                                            <h4>
                                                {paidConvert ? paidConvert : wish.paid}
                                                {wish.currency ? wish.currency : 'USD'}
                                                {' of '}
                                                {wish.amount ? wish.amount : wish.price}
                                                {wish.currency ? wish.currency : 'USD'}
                                            </h4>
                                            <p>
                                                {wish.senders && wish.senders.length}
                                                {wish.senders ?
                                                    ` contributer${wish.senders.length < 2 ? '' : 's'}` :
                                                    "no contributions yet"}
                                            </p>
                                        </div>

                                        <div className='doublegapver' />

                                        <div style={{ opacity: "0.9" }}>
                                            <ResponsiveContainer
                                                width="100%"
                                                height={160}
                                            >
                                                <PieChart>
                                                    <Pie
                                                        data={data}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={0}
                                                        outerRadius={80}
                                                        dataKey="value"
                                                        paddingAngle={0}
                                                    >
                                                        {data.map((entry, index) => (
                                                            <Cell
                                                                key={entry.name}
                                                                fill={entry.color}
                                                            />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className='doublegapver' />

                                        <button
                                            onClick={() => { setThisWish(wish) }}
                                            style={{ width: "100%" }}
                                        >
                                            {"Contribute"}
                                        </button>

                                    </div>
                                )

                            })}
                        </div>
                    }

                    {thisWish._id && event &&
                        <div className="card" style={{ width: "100%", padding: "32px" }}>

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
                                    cardHTML={formData.cardHTML}
                                />
                            }

                            {/* <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <div
                                    style={{ height: "16px", width: "16px", backgroundColor: expandedView === 'PERSONAL' ? "grey" : "lightgrey" }}
                                    onClick={() => setExpandedView('PERSONAL')}
                                />
                                <div className="gaphor" />
                                <div
                                    style={{ height: "16px", width: "16px", backgroundColor: expandedView === 'PAYMENT' ? "grey" : "lightgrey" }}
                                    onClick={() => setExpandedView('PAYMENT')}
                                />
                            </div> */}
                        </div>
                    }

                    <div className='doublegapver' />
                    <div className='doublegapver' />
                    <div className='doublegapver' />
                </div>
            </div>
        </div>

    )
}

export default Note;