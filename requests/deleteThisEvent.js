import getEventsForThisUser from "./getEventsForThisUser";
import getWishesForThisEvent from "./getWishesForThisEvent";

const deleteThisEvent = async (sub, id, setCurrentEvent, setEvents, setNotes) => {
    try {
        const res = await fetch(`/api/deleteEvent/${id}`, {
            method: "DELETE"
        });
        const resJSON = await res.json()

        getEventsForThisUser(sub, setEvents)
        setCurrentEvent(resJSON.data)
        getWishesForThisEvent(resJSON.data._id, setNotes)
    } catch (error) {
        console.log("Error trying to delete event")
    }

}

export default deleteThisEvent