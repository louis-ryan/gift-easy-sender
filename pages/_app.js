import { useState } from 'react';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import Navbar from '../components/Navbar';

import '../css/buttons.css';
import '../css/card.css';
import '../css/fonts.css';
import '../css/homepage.css';
import '../css/inputs.css';
import '../css/modal.css';
import '../css/navbar.css';
import '../css/utils.css';

function MyApp({ Component, pageProps }) {

    const [events, setEvents] = useState([]);
    const [currentEvent, setCurrentEvent] = useState({})
    const [currentEventStr, setCurrentEventStr] = useState("")
    const [accountId, setAccountId] = useState("")
    const [modalOpen, setModalOpen] = useState(false)
    const [notes, setNotes] = useState([])

    return (
        <UserProvider>
            <Navbar
                events={events}
                setEvents={setEvents}
                currentEvent={currentEvent}
                setCurrentEvent={setCurrentEvent}
                currentEventStr={currentEventStr}
                setCurrentEventStr={setCurrentEventStr}
                accountId={accountId}
                setAccountId={setAccountId}
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
                notes={notes}
                setNotes={setNotes}
            />
            <Component
                events={events}
                setEvents={setEvents}
                currentEvent={currentEvent}
                setCurrentEvent={setCurrentEvent}
                currentEventStr={currentEventStr}
                setCurrentEventStr={setCurrentEventStr}
                accountId={accountId}
                setAccountId={setAccountId}
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
                notes={notes}
                setNotes={setNotes}
                {...pageProps}
            />
        </UserProvider>
    )
}

export default MyApp