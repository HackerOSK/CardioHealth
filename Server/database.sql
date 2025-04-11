CREATE DATABASE IF NOT EXISTS cardiohealth;
USE cardiohealth;

CREATE TABLE users (
    ID VARCHAR(100) PRIMARY KEY,
    email VARCHAR(100),
    name VARCHAR(100)
);

CREATE TABLE reports (
    reportId INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(100),
    age INT,
    sex TINYINT,
    cp TINYINT,
    trestbps INT,
    chol INT,
    fbs TINYINT,
    restecg TINYINT,
    thalach INT,
    exang TINYINT,
    oldpeak FLOAT,
    slope TINYINT,
    ca TINYINT,
    thal TINYINT,
    prediction TINYINT,
    confidence FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(ID)
);
