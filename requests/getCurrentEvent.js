import getWishesForThisEvent from "./getWishesForThisEvent"

const getCurrentEvent = async (setCurrentEvent, setModalOpen, setNotes, currentEventStr) => {
    try {
        const res = await fetch(`api/getCurrentEventForUser/${currentEventStr}`)
        const resJSON = await res.json()
        if (resJSON.data) {
            setCurrentEvent(resJSON.data)
            getWishesForThisEvent(resJSON.data._id, setNotes)
        } else {
            setModalOpen(true)
        }
    } catch (error) {
        console.log("issue getting current event: ", error)
    }
}

export default getCurrentEvent