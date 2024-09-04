import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const userId = 1; // Replace this with the actual user ID or fetch it dynamically

    useEffect(() => {
        axios.get(`http://localhost/myapp-server/getUserData.php?user_id=${userId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the user data!', error);
            });
    }, [userId]);

    if (!userData) {
        return <div style={styles.loading}>Loading...</div>;
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>User Profile</h1>
            <div style={styles.profileContainer}>
                <img
                    src="path_to_profile_picture.jpg" 
                    alt="Profile"
                    style={styles.profileImage}
                />
                <div style={styles.infoContainer}>
                    <p style={styles.info}><strong>Username:</strong> {userData.username}</p>
                    <p style={styles.info}><strong>Email:</strong> {userData.email}</p>
                    <p style={styles.info}><strong>Phone:</strong> {userData.phone}</p>
                    <p style={styles.info}><strong>Role:</strong> {userData.role}</p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '600px',
        margin: 'auto',
        fontFamily: 'Arial, sans-serif',
    },
    heading: {
        fontSize: '2.5em',
        textAlign: 'center',
        marginBottom: '20px',
    },
    loading: {
        textAlign: 'center',
        fontSize: '1.5em',
        marginTop: '50px',
    },
    profileContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    profileImage: {
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        marginBottom: '20px',
    },
    infoContainer: {
        width: '100%',
    },
    info: {
        fontSize: '1.2em',
        margin: '10px 0',
    },
};

export default Profile;
