import getCurrentEvent from "./getCurrentEvent"

const getOrCreateNewAccount = async (sub, email, setCurrentEvent, setAccountId, setModalOpen, setNotes) => {
    try {
        console.log("sub: ", sub)
        const res = await fetch(`api/getAccountForThisUser/${sub + '||' + email}`)
        const resJSON = await res.json()
        if (resJSON.success === true) {
            console.log("current event: ", resJSON.data)
            setAccountId(resJSON.data._id)
            if (!resJSON.data.currentEventStr) {
                setModalOpen(true)
            } else {
                getCurrentEvent(setCurrentEvent, setModalOpen, setNotes, resJSON.data.currentEventStr)
            }
        } else {
            console.log("There has been a problem getting or making your new account")
        }
    } catch (error) {
        console.log("issue getting user's account: ", error)
    }
}

export default getOrCreateNewAccount