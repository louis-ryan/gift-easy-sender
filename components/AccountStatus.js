import { useEffect, useState } from 'react';

export default function AccountStatus({ user }) {
  if (!user.stripeAccountId) {
    return null;
  }

  const styles = {
    container: {
      marginTop: '20px',
      padding: '20px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px'
    },
    title: {
      fontSize: '18px',
      fontWeight: 500,
      marginBottom: '12px'
    },
    statusList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    statusItem: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '12px'
    },
    statusDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      marginRight: '10px'
    },
    statusSuccess: {
      backgroundColor: '#22c55e'
    },
    statusError: {
      backgroundColor: '#ef4444'
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Payment Account Status</h3>
      <ul style={styles.statusList}>
        <li style={styles.statusItem}>
          <span style={{
            ...styles.statusDot,
            ...(user.stripeAccountStatus.detailsSubmitted ? styles.statusSuccess : styles.statusError)
          }} />
          Account Details: {user.stripeAccountStatus.detailsSubmitted ? 'Submitted' : 'Incomplete'}
        </li>
        <li style={styles.statusItem}>
          <span style={{
            ...styles.statusDot,
            ...(user.stripeAccountStatus.chargesEnabled ? styles.statusSuccess : styles.statusError)
          }} />
          Charges Status: {user.stripeAccountStatus.chargesEnabled ? 'Enabled' : 'Disabled'}
        </li>
        <li style={styles.statusItem}>
          <span style={{
            ...styles.statusDot,
            ...(user.stripeAccountStatus.payoutsEnabled ? styles.statusSuccess : styles.statusError)
          }} />
          Payouts Status: {user.stripeAccountStatus.payoutsEnabled ? 'Enabled' : 'Disabled'}
        </li>
      </ul>
    </div>
  );
}