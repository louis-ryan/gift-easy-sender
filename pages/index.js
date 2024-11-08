import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import getCurrentEvent from '../requests/getCurrentEvent';
import deleteThisEvent from '../requests/deleteThisEvent';
import getOrCreateNewAccount from '../requests/getOrCreateNewAccount';
import WishCard from '../components/WishCard';
import ConnectOnboarding from '../components/ConnectOnboarding';
import AccountStatus from '../components/AccountStatus';


const Index = (props) => {

  const router = useRouter()
  const { user } = useUser();

  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  const handleDeletion = () => {
    if (props.events === 0) return
    deleteThisEvent(
      user.sub,
      props.currentEvent._id,
      props.setCurrentEvent,
      props.setEvents,
      props.setNotes
    )
  }

  useEffect(() => {
    if (!user) return
    getOrCreateNewAccount(
      user.sub,
      user.email,
      props.setCurrentEvent,
      props.setAccountId,
      props.setModalOpen,
      props.setNotes,
    )
  }, [user])

  // useEffect(() => {
  //   if (!props.currentEventStr) return
  //   getCurrentEvent(
  //     props.setCurrentEvent,
  //     props.setModalOpen,
  //     props.setNotes,
  //     props.currentEventStr
  //   )
  // }, [props.currentEventStr, props.events])

  if (!props.currentEvent) return

  if (!user) return

  return (
    <div className="container">
      <div className="wrapper">

        <div>
          <ConnectOnboarding userId={props.accountId} email={user.email} />
        </div>
        <div>
          <AccountStatus user={user} />
        </div>

        <h1>{props.currentEvent.name}</h1>
        <h4>{formatDate(props.currentEvent.date)}</h4>
        <p>{props.currentEvent.description}</p>
        <div className="cardspace">
          {props.notes.map(note => {
            return (
              <WishCard
                note={note}
              />
            )
          })}
          <div
            className='card'
            onClick={() => router.push("/new")}
          >
            <h3>{"+ Add a wish"}</h3>
          </div>
        </div>
        <div className='doublegapver' />
        <button onClick={handleDeletion}>{"DELETE EVENT"}</button>
      </div>
    </div>
  )
}

export default Index;