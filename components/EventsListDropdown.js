import { useEffect } from 'react';
import setThisEventToCurrent from '../requests/setThisEventToCurrent';
import getEventsForThisUser from '../requests/getEventsForThisUser';
import getWishesForThisEvent from '../requests/getWishesForThisEvent';

const EventsListDropdown = ({ user, events, setEvents, setModalOpen, currentEvent, setCurrentEvent, setNotes }) => {

    const handleChange = (e) => {
        const id = e.target.value
        if (id === 'NEW') { setModalOpen(true); return }
        setThisEventToCurrent(id, setCurrentEvent)
        getWishesForThisEvent(id, setNotes)
    };

    useEffect(() => {
        if (!user) return
        getEventsForThisUser(user.sub, setEvents)
    }, [user])

    return (
        <select
            name="dropdown"
            onChange={handleChange}
            value={currentEvent._id}
        >
            {events.map((event) => (
                <option
                    key={event._id}
                    value={event._id}
                    href="#"
                >
                    {event.name}
                </option>
            ))}
            <option value={'NEW'}>+ Create New</option>
        </select>
    )
};

export default EventsListDropdown;