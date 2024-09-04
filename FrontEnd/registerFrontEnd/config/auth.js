// src/auth.js
export const authenticateUser = async (email, password) => {
    const response = await fetch('http://localhost:3002/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data.user; // Return user details to determine redirection
    } else {
        throw new Error(data.message);
    }
};
