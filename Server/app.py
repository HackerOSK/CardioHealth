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
CORS(app, supports_credentials=True)
# Initialize Firebase Admin
cred = credentials.Certificate("cardiohealth-e95c7-firebase-adminsdk-fbsvc-0b8e7d2709.json")
firebase_admin.initialize_app(cred)
auth = firebase_admin.auth

# MySQL Configuration
db_config = {
    'host': '34.47.134.186',
    'user': 'root',
    'password': 'Omkar@2004',
    'database': 'cardiohealth'
}

def add_user_to_db(user_id, email, display_name):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        
        cursor.execute(
            "INSERT INTO users (ID, email, name) VALUES (%s, %s, %s)",
            (user_id, email, display_name)
        )
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error adding user to database: {e}")
        if conn:
            conn.close()
        return False
    return True


def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None



def verify_firebase_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if the Authorization header exists
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'No authorization header provided'}), 401
        
        # Extract the token
        token = auth_header.split('Bearer ')[1] if 'Bearer ' in auth_header else None
        if not token:
            return jsonify({'error': 'Invalid token format'}), 401
        
        try:
            # Verify the token with Firebase Admin SDK
            decoded_token = auth.verify_id_token(token)
            # Add the decoded token to the request context
            request.user = decoded_token
            return f(*args, **kwargs)
        except Exception as e:
            print(f"Token verification error: {e}")
            return jsonify({'error': 'Invalid or expired token'}), 401
            
    return decorated_function


# xRoutes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        display_name = data.get('displayName')

        # Create user in Firebase
        user = auth.create_user(
            email=email,
            password=password,
            display_name=display_name
        )
        
        # Add user to database
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (ID, EMAIL, NAME) VALUES (%s, %s, %s)",
            (user.uid, email, display_name)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'userId': user.uid,
            'email': email,
            'displayName': display_name
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        print(data)
        email = data['body']['email']
        password = data['body']['password']
        print(email, password)

        # Sign in with Firebase
        user = auth.get_user_by_email(email)
        
        
        # Check if user exists in database
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE EMAIL = %s", (email,))
        user_data = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user_data:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            'success': True,
            'userId': user.uid,
            'email': user.email,
            'displayName': user.display_name,
            'photoURL': user.photo_url if hasattr(user, 'photo_url') else None
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/auth/google/verify', methods=['POST'])
def verify_google_token():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'No token provided'}), 401

        token = auth_header.split('Bearer ')[1]
        decoded_token = auth.verify_id_token(token)
        
        # Get user info from Firebase
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
            'isExisting': exists > 0
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/auth/sync-user', methods=['POST'])
@verify_firebase_token
def sync_user():
    try:
        # Debug logging
        print("Headers received:", request.headers)
        print("Token info:", request.user)  # Added by verify_firebase_token
        
        data = request.get_json()
        print("Request data:", data)
        
        user_id = data.get('userId')
        body = data.get('body', {})
        email = body.get('email')
        display_name = body.get('displayName')
        
        if not all([user_id, email, display_name]):
            return jsonify({
                'error': 'Missing required fields',
                'received': {
                    'userId': user_id,
                    'email': email,
                    'displayName': display_name
                }
            }), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT ID FROM users WHERE ID = %s", (user_id,))
        user_exists = cursor.fetchone()
        
        if not user_exists:
            # Create new user
            cursor.execute(
                "INSERT INTO users (ID, EMAIL, NAME) VALUES (%s, %s, %s)",
                (user_id, email, display_name)
            )
        else:
            # Update existing user
            cursor.execute(
                "UPDATE users SET EMAIL = %s, NAME = %s WHERE ID = %s",
                (email, display_name, user_id)
            )
            
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'User synchronized successfully',
            'isNewUser': not user_exists
        }), 200

    except Exception as e:
        print(f"Error syncing user: {e}")
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

def add_user_to_db(user_id, email, display_name):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT COUNT(*) FROM users WHERE ID = %s", (user_id,))
        exists = cursor.fetchone()[0]
        
        if not exists:
            # Insert new user
            cursor.execute(
                "INSERT INTO users (ID, EMAIL, NAME) VALUES (%s, %s, %s)",
                (user_id, email, display_name)
            )
            conn.commit()
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error adding user to database: {e}")
        if conn:
            conn.close()

@app.route('/api/predict', methods=['POST'])
@verify_firebase_token
def make_prediction():
    try:
        # Get user ID from the verified token
        user_id = request.user['uid']
        user_email = request.user['email']
        user_name = request.user.get('name', '')

        # First, ensure user exists in database
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT ID FROM users WHERE ID = %s", (user_id,))
        user_exists = cursor.fetchone()
        
        if not user_exists:
            # Create user if doesn't exist
            try:
                cursor.execute(
                    "INSERT INTO users (ID, email, name) VALUES (%s, %s, %s)",
                    (user_id, user_email, user_name)
                )
                conn.commit()
            except Exception as e:
                conn.rollback()
                return jsonify({'error': f'Failed to create user: {str(e)}'}), 500

        # Get prediction data
        data = request.get_json()
        
        # Validate and process prediction data
        validated_data = {
            'age': int(data['age']),
            'sex': int(data['sex']),
            'cp': int(data['cp']),
            'trestbps': int(data['trestbps']),
            'chol': int(data['chol']),
            'fbs': int(data['fbs']),
            'restecg': int(data['restecg']),
            'thalach': int(data['thalach']),
            'exang': int(data['exang']),
            'oldpeak': float(data['oldpeak']),
            'slope': int(data['slope']),
            'ca': int(data['ca']),
            'thal': int(data['thal'])
        }

        # Make prediction
        result = predict_heart_disease(validated_data)
        
        if 'error' in result:
            return jsonify(result), 400

        # Store prediction in database
        try:
            insert_query = """
                INSERT INTO reports (
                    userId, age, sex, cp, trestbps, chol, fbs, restecg, 
                    thalach, exang, oldpeak, slope, ca, thal, 
                    prediction, confidence
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
            """
            
            prediction = 1 if result['prediction'] == "Heart Disease exists" else 0
            confidence = float(result['confidence'].strip('%')) / 100
            
            values = (
                user_id, validated_data['age'], validated_data['sex'],
                validated_data['cp'], validated_data['trestbps'],
                validated_data['chol'], validated_data['fbs'],
                validated_data['restecg'], validated_data['thalach'],
                validated_data['exang'], validated_data['oldpeak'],
                validated_data['slope'], validated_data['ca'],
                validated_data['thal'], prediction, confidence
            )
            
            cursor.execute(insert_query, values)
            report_id = cursor.lastrowid
            conn.commit()

            return jsonify({
                'reportId': report_id,
                'prediction': result['prediction'],
                'confidence': result['confidence'],
                'risk_factors': result.get('risk_factors', [])
            }), 200

        except Exception as e:
            conn.rollback()
            return jsonify({'error': f'Failed to save report: {str(e)}'}), 500
        
        finally:
            cursor.close()
            conn.close()

    except Exception as e:
        print(f"Prediction API error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/latest', methods=['GET'])
@verify_firebase_token
def get_latest_report():
    try:
        # Get user ID from the verified token
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
                created_at as timestamp
            FROM reports 
            WHERE userId = %s 
            ORDER BY created_at DESC 
            LIMIT 1
        """
        
        cursor.execute(query, (user_id,))
        report = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not report:
            return jsonify({'error': 'No reports found'}), 200

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
        print(f"Error in get_latest_report: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
