from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth
from functools import wraps
import os
import mysql.connector
from mysql.connector import Error
from modelTest import predict_heart_disease
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Initialize Firebase Admin
cred = credentials.Certificate("cardiohealth-e95c7-firebase-adminsdk-fbsvc-0b8e7d2709.json")
firebase_admin.initialize_app(cred)

# MySQL Configuration
db_config = {
    'host': '34.47.134.186',
    'user': 'root',
    'password': 'Omkar@2004',
    'database': 'cardiohealth'
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def verify_token(f):
    """Decorator for verifying Firebase ID tokens"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'No token provided'}), 401
        
        try:
            token = auth_header.split('Bearer ')[1]
            decoded_token = auth.verify_id_token(token)
            request.user = decoded_token
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': str(e)}), 401
    
    return decorated_function


# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user with email and password"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        display_name = data.get('displayName')

        user = auth.create_user(
            email=email,
            password=password,
            display_name=display_name,
            email_verified=False
        )

        return jsonify({
            'message': 'Successfully created user',
            'userId': user.uid
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login with email and password"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # Verify the user credentials using Firebase Admin SDK
        user = auth.get_user_by_email(email)
        
        # Add user to database
        add_user_to_db(user.uid, user.email, user.display_name)
        
        # Check if user exists in database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM users WHERE ID = %s", (user.uid,))
        exists = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        
        return jsonify({
            'userId': user.uid,
            'email': user.email,
            'displayName': user.display_name,
            'emailVerified': user.email_verified,
            'isExisting': 1 if exists > 0 else 0
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    """Generate password reset link"""
    try:
        data = request.get_json()
        email = data.get('email')

        reset_link = auth.generate_password_reset_link(email)
        
        # TODO: Implement email sending functionality
        return jsonify({
            'message': 'Password reset link generated',
            'resetLink': reset_link
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/auth/google/verify', methods=['POST'])
def verify_google_token():
    """Verify Google Sign-In Token"""
    try:
        data = request.get_json()
        id_token = data.get('idToken')

        # Verify the ID token
        decoded_token = auth.verify_id_token(id_token)
        
        # Get user info
        user = auth.get_user(decoded_token['uid'])
        
        # Add user to database
        add_user_to_db(user.uid, user.email, user.display_name)
        
        # Check if user exists in database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM users WHERE ID = %s", (user.uid,))
        exists = cursor.fetchone()[0]
        cursor.close()
        conn.close()

        return jsonify({
            'userId': user.uid,
            'email': user.email,
            'displayName': user.display_name,
            'photoURL': user.photo_url,
            'isExisting': 1 if exists > 0 else 0
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


# Protected Routes
@app.route('/api/user/profile', methods=['GET'])
@verify_token
def get_user_profile():
    """Get user profile (Protected Route)"""
    try:
        user_id = request.user['uid']
        user = auth.get_user(user_id)

        return jsonify({
            'userId': user.uid,
            'email': user.email,
            'displayName': user.display_name,
            'photoURL': user.photo_url,
            'emailVerified': user.email_verified
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Add new route to check if user exists
@app.route('/api/auth/check-user', methods=['POST'])
def check_user():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM users WHERE ID = %s", (user_id,))
        count = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        return jsonify({'exists': 1 if count > 0 else 0}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def add_user_to_db(user_id, email, name):
    try:
        conn = get_db_connection()
        if not conn:
            return False
            
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (ID, email, name) 
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE email=%s, name=%s
        """, (user_id, email, name, email, name))
        
        conn.commit()
        cursor.close()
        conn.close()
        return True
        
    except Error as e:
        print(f"Database error: {e}")
        return False

@app.route('/api/predict', methods=['POST'])
@verify_token
def make_prediction():
    try:
        # Get user ID from the verified token
        user_id = request.user['uid']
        
        # Get input data
        data = request.get_json()
        required_fields = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 
                         'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 
                         'ca', 'thal']
        
        # Validate input data
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
            
        # Make prediction
        result = predict_heart_disease(data)
        
        if 'error' in result:
            return jsonify(result), 400
            
        # Extract prediction and confidence
        prediction = 1 if result['prediction'] == "Heart Disease exists" else 0
        confidence = float(result['confidence'].strip('%')) / 100
        
        # Store in database
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = conn.cursor()
        
        # Insert into reports table
        insert_query = """
            INSERT INTO reports (
                userId, age, sex, cp, trestbps, chol, fbs, restecg, 
                thalach, exang, oldpeak, slope, ca, thal, 
                prediction, confidence, created_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s
            )
        """
        
        values = (
            user_id, data['age'], data['sex'], data['cp'], data['trestbps'],
            data['chol'], data['fbs'], data['restecg'], data['thalach'],
            data['exang'], data['oldpeak'], data['slope'], data['ca'],
            data['thal'], prediction, confidence, datetime.now()
        )
        
        cursor.execute(insert_query, values)
        report_id = cursor.lastrowid
        
        conn.commit()
        cursor.close()
        conn.close()
        
        # Return prediction result along with report ID
        return jsonify({
            'reportId': report_id,
            'prediction': result['prediction'],
            'confidence': result['confidence'],
            'risk_factors': result['risk_factors']
        }), 200
        
    except Exception as e:
        logger.error(f"Prediction API error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/latest', methods=['GET'])
@verify_token
def get_latest_report():
    try:
        user_id = request.user['uid']
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = conn.cursor(dictionary=True)
        
        # Updated query to use CREATED_AT (matching the database schema)
        query = """
            SELECT 
                reportId,
                age,
                sex,
                cp,
                trestbps as bloodPressure,
                chol as cholesterol,
                thalach as heartRate,
                prediction,
                confidence,
                createdAt as timestamp
            FROM reports 
            WHERE userId = %s 
            ORDER BY createdAt DESC 
            LIMIT 1
        """
        
        cursor.execute(query, (user_id,))
        report = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not report:
            return jsonify({'error': 'No reports found'}), 404

        return jsonify({
            'prediction': {
                'result': "Heart Disease exists" if report['prediction'] == 1 else "No Heart Disease",
                'confidence': f"{report['confidence']:.2%}"
            },
            'vitals': {
                'bloodPressure': report['bloodPressure'],
                'cholesterol': report['cholesterol'],
                'heartRate': report['heartRate']
            },
            'timestamp': report['timestamp'].isoformat()
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

