const getEventsForThisUser = async (sub, setEvents) => {
    try {
        const res = await fetch(`/api/getEventsFor/${sub}`);
        const resJSON = await res.json();
        setEvents(resJSON.data)
    } catch (error) {
        console.log("No events found for this user.")
    }
}

export default getEventsForThisUser