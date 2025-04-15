import { auth } from '../firebase/config';
import { 
    signInWithPopup, 
    GoogleAuthProvider, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import axios from 'axios';

const API_URL = 'https://cardiohealth.publicvm.com/api'; // replace with your backend URL

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    
    }
});

// Add token to requests
axiosInstance.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken(true);
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const registerUser = async (email, password, displayName) => {
    try {
        // Create user in Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Sync user with backend
        await axiosInstance.post('/auth/sync-user', {
            displayName,
            email: user.email
        });

        return {
            success: true,
            userId: user.uid,
            email: user.email,
            displayName: displayName
        };
    } catch (error) {
        console.error('Registration error:', error);
        throw new Error(error.message);
    }
};

// Update your loginUser function to include the auth token in the request
export const loginUser = async (email, password) => {
    try {
        // Login with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get a fresh ID token
        const idToken = await user.getIdToken(true);
        
        // Debug logs
        console.log('User authenticated:', user.uid);
        console.log('Token obtained:', idToken.substring(0, 10) + '...');

        // Create a one-time axios instance with the token
        const response = await axios({
            method: 'post',
            url: `${API_URL}/auth/sync-user`,
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
            },
            data: {
                userId: user.uid,
                body: {
                    displayName: user.displayName,
                    email: user.email
                }
            }
        });

        console.log('Sync response:', response.data);

        return {
            success: true,
            userId: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
        };
    } catch (error) {
        // Enhanced error logging
        console.error('Login error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        if (error.response?.status === 401) {
            throw new Error('Authentication failed. Please try again.');
        }
        throw new Error(error.message);
    }
};



export const googleSignIn = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        if (!user) {
            throw new Error('No user returned from Firebase');
        }

        // Get Firebase ID token
        const idToken = await user.getIdToken(true);

        // Store token locally for future use
        localStorage.setItem('authToken', idToken);

        // Prepare user data to sync with backend
        const userData = {
            userId: user.uid,
            body: {
                email: user.email,
                displayName: user.displayName
            }
        };

        // Send request to backend
        const response = await axios.post(`${API_URL}/auth/sync-user`, userData, {
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('User synced:', response.data);

        return {
            success: true,
            userId: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            isNewUser: response.data?.isNewUser ?? false
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Backend error:', error.response?.data || error.message);
        } else {
            console.error('Google sign-in error:', error.message);
        }

        return {
            success: false,
            message: error.message
        };
    }
};

export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true, message: 'Password reset email sent' };
    } catch (error) {
        console.error('Password reset error:', error);
        throw new Error(error.message);
    }
};

export const getUserProfile = async () => {
    try {
        const response = await axiosInstance.get('/user/profile');
        return response.data;
    } catch (error) {
        console.error('Get profile error:', error);
        throw new Error(error.response?.data?.error || error.message);
    }
};

export const logoutUser = async () => {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        throw new Error(error.message);
    }
};
