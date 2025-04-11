import { auth } from '../firebase/config';
import { 
    signInWithPopup, 
    GoogleAuthProvider, 
    signInWithEmailAndPassword as firebaseSignIn,
    createUserWithEmailAndPassword as firebaseSignUp
} from 'firebase/auth';

const API_URL = 'http://192.168.1.7:5000/api';

export const registerUser = async (email, password, displayName) => {
    try {
        // Create user in Firebase
        const userCredential = await firebaseSignUp(auth, email, password);
        
        // Register user in backend
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                displayName
            }),
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        return userCredential.user;
    } catch (error) {
        throw error;
    }
};

export const loginUser = async (email, password) => {
    try {
        // Sign in with Firebase
        const userCredential = await firebaseSignIn(auth, email, password);
        
        // Verify with backend
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password
            }),
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        return { ...userCredential.user, isExisting: data.isExisting };
    } catch (error) {
        throw error;
    }
};

export const googleSignIn = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        
        // Get ID token
        const idToken = await result.user.getIdToken();
        
        // Verify with backend
        const response = await fetch(`${API_URL}/auth/google/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idToken
            }),
        });

        if (!response.ok) {
            throw new Error('Google sign-in verification failed');
        }

        const data = await response.json();
        return { ...result.user, isExisting: data.isExisting };
    } catch (error) {
        throw error;
    }
};

export const resetPassword = async (email) => {
    try {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email
            }),
        });

        if (!response.ok) {
            throw new Error('Password reset failed');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
};

export const getUserProfile = async () => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('No user logged in');
        }

        const idToken = await user.getIdToken();
        
        const response = await fetch(`${API_URL}/user/profile`, {
            headers: {
                'Authorization': `Bearer ${idToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user profile');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};




