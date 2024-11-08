const getWishesForThisEvent = async (id, setNotes) => {
    const res = await fetch(`/api/getWishesForThisEvent/${id}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    const { data } = await res.json();
    setNotes(data)
}

export default getWishesForThisEvent