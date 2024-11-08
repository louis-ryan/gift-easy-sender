import fetch from 'isomorphic-unfetch';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import PaymentForm from '../../components/PaymentForm';

const Note = ({ note }) => {

    const router = useRouter();

    const deleteNote = async () => {
        const noteId = router.query.id;
        try {
            const deleted = await fetch(`http://localhost:3000/api/notes/${noteId}`, {
                method: "Delete"
            });
            console.log("deleted: ", deleted)
            router.push("/");
        } catch (error) {
            console.log(error)
        }
    }

    return (

        <div className="container">
            <div className="wrapper">
                <h1>{note.title}</h1>
                <p>{note.description}</p>
                <PaymentForm
                    amount={note.price}
                    recipientId={note._id}
                    giftId={note._id}
                />
                <button onClick={deleteNote}>Delete</button>
            </div>
        </div>

    )
}

Note.getInitialProps = async ({ query: { id } }) => {
    const res = await fetch(`http://localhost:3000/api/notes/${id}`);
    const { data } = await res.json();

    return { note: data }
}

export default Note;