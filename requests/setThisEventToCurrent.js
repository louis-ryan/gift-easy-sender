const setThisEventToCurrent = async (id, setCurrentEvent) => {
    try {
        const res = await fetch(`api/setCurrentToTrueForEvent/${id}`, {
            method: 'PATCH',
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({ current: true })
        })
        const resJSON = await res.json()
        setCurrentEvent(resJSON.data)
    } catch (error) {
        console.log("issue sending new event to server: ", error)
    }
}

export default setThisEventToCurrent;