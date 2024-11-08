import getEventsForThisUser from "./getEventsForThisUser"
import getWishesForThisEvent from "./getWishesForThisEvent"

const postNewEvent = async (user, formData, setModalOpen, setErrors, setEvents, setCurrentEvent, setNotes) => {
    try {
        const res = await fetch(`api/postNewEventForUser/${user.sub}`, {
            method: 'POST',
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })
        const resJSON = await res.json()
        console.log("post new event res: ", resJSON)
        if (resJSON.success === true) {
            setCurrentEvent(resJSON.data)
            getEventsForThisUser(user.sub, setEvents)
            getWishesForThisEvent(resJSON.data._id, setNotes)
            setModalOpen(false)
        } else {
            setErrors(resJSON.error.errors)
        }
    } catch (error) {
        console.log("issue sending new event to server: ", error)
    }
}

export default postNewEvent