import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import NewEventModal from './NewEventModal';
import EventsListDropdown from './EventsListDropdown';


const Navbar = ({
    events,
    setEvents,
    currentEvent,
    setCurrentEvent,
    currentEventStr,
    setCurrentEventStr,
    modalOpen,
    setModalOpen,
    notes,
    setNotes
}) => {

    const { user } = useUser();

    if (!currentEvent) return

    return (
        <>
            {modalOpen && user &&
                <NewEventModal
                    events={events}
                    setEvents={setEvents}
                    setModalOpen={setModalOpen}
                    user={user}
                    setCurrentEvent={setCurrentEvent}
                    setNotes={setNotes}
                />
            }
            <nav className="navbar">
                <Link href="/">
                    <h2>Wish List Sundae</h2>
                </Link>
                <div className="logincontainer">
                    {user ? (
                        <>
                            <div className='profilepicture'>
                                <img height={40} width={40} src={user.picture} alt="profile picture" />
                            </div>
                            <div className='doublegaphor' />
                            <div>
                                <EventsListDropdown
                                    user={user}
                                    events={events}
                                    setEvents={setEvents}
                                    setModalOpen={setModalOpen}
                                    currentEvent={currentEvent}
                                    setCurrentEvent={setCurrentEvent}
                                    setNotes={setNotes}
                                />
                            </div>
                            <div className='gaphor' />
                            <Link href="/api/auth/logout">
                                <h2>Logout</h2>
                            </Link>
                        </>
                    ) : (
                        <Link href="/api/auth/login">
                            <h2>Login</h2>
                        </Link>
                    )}
                </div>
            </nav>
        </>
    )
}

export default Navbar;