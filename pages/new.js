import { useState, useEffect } from 'react';
import fetch from 'isomorphic-unfetch';
import { useRouter } from 'next/router';

const NewNote = (props) => {
    const [form, setForm] = useState({ event: props.currentEvent._id, title: '', price: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    console.log("is submitting: ", isSubmitting)
    const [errors, setErrors] = useState({});
    const router = useRouter();

    useEffect(() => {
        if (isSubmitting) {
            if (Object.keys(errors).length === 0) {
                createNote();
            } else {
                setIsSubmitting(false);
            }
        }
    }, [errors])

    const createNote = async () => {
        console.log("form: ", form)
        try {
            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            })
            console.log("create note res: ", res)
            router.push("/");
        } catch (error) {
            console.log(error);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        let errs = validate();
        setErrors(errs);
        setIsSubmitting(true);
    }

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handlePrice = (e) => {
        const cleanValue = e.target.value.replace(/[^\d.]/g, '');
        const parts = cleanValue.split('.');
        const formattedValue = parts[0] + (parts.length > 1 ? '.' + parts[1].slice(0, 2) : '');
        setForm({
            ...form,
            price: formattedValue
        })
    }

    const validate = () => {
        let err = {};

        if (!form.title) {
            err.title = 'Title is required';
        }
        if (!form.description) {
            err.description = 'Description is required';
        }

        return err;
    }

    return (
        <div className="container">
            <div className="smallwrapper">
                <h1>New Wish</h1>
                <div>
                    {isSubmitting
                        ? <div />
                        : <form onSubmit={handleSubmit}>
                            <input
                                fluid
                                error={errors.title ? { content: 'Please enter a title', pointing: 'below' } : null}
                                label='Title'
                                placeholder='Trip to Bali'
                                name='title'
                                onChange={handleChange}
                                value={form.title}
                            />
                            <div className='gapver' />
                            <input
                                fluid
                                error={errors.price ? { content: 'Please enter a price', pointing: 'below' } : null}
                                label='Price'
                                placeholder='670.00'
                                inputMode='decimal'
                                onChange={handlePrice}
                                value={form.price}
                            />
                            <div className='gapver' />
                            <textarea
                                fluid
                                label='Description'
                                placeholder='5 days away with my lovely partner'
                                name='description'
                                error={errors.description ? { content: 'Please enter a description', pointing: 'below' } : null}
                                onChange={handleChange}
                                value={form.description}
                            />
                            <button type='submit'>Create</button>
                        </form>
                    }
                </div>
            </div>
        </div>

    )
}

export default NewNote;