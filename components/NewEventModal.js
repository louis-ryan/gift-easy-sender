import { useState } from "react";
import postNewEvent from "../requests/postNewEvent";

const NewEventModal = ({ events, setEvents, setModalOpen, user, setCurrentEvent, setNotes }) => {

    const [errors, setErrors] = useState({})
    const [formData, setFormData] = useState({
        user: user.sub,
        name: '',
        date: '',
        description: '',
        current: true
    });

    const handleModal = () => {
        if (events.length === 0) return
        setModalOpen(false)
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        postNewEvent(user, formData, setModalOpen, setErrors, setEvents, setCurrentEvent, setNotes)
    };

    return (
        <>
            <div className='dark modalbackground' />
            <div
                className='clickable modalbackground'
                onClick={handleModal}
            >
                <div
                    className='modalcontainer'
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2>Create New Event</h2>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="name">Event Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={errors.name && "inputerror"}
                            required
                        />
                        <div className="error">{errors.name?.message}</div>
                        <div className="doublegapver" />
                        <label htmlFor="date">Event Date:</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <div className="doublegapver" />
                        <label htmlFor="description">Event Description:</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className={errors.description && "inputerror"}
                            rows="4"
                        ></textarea>
                        <div className="error">{errors.description?.message}</div>
                        <div className="doublegapver" />
                        <button
                            type="submit"
                            className="fullwidth"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </>
    )

}

export default NewEventModal;