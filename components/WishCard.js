import { useRouter } from 'next/router';

const WishCard = ({note}) => {

    const router = useRouter()

    return (

        <div
            key={note._id}
            className='card'
        >
            <h3>{note.title}</h3>
            <h3>$0 of ${note.price}</h3>
            <div className="cardactions">
                <button onClick={() => { router.push(`/${note._id}`) }}>
                    {"View"}
                </button>
                <div className='gaphor' />
                <button onClick={() => { router.push(`/${note._id}/edit`) }}>
                    {"Edit"}
                </button>
            </div>
        </div>
    )
}

export default WishCard;