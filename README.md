# CardioHealth

CardioHealth is a software system designed to improve cardiovascular health through data analysis, prediction, and visualization. This project is implemented primarily in Python, with additional components in Cython, C, C++, and JavaScript.

---

## Table of Contents
1. [Features](#features)
2. [Prerequisites](#prerequisites)
3. [Setup Instructions](#setup-instructions)
   - [Running the Server](#running-the-server)
   - [Running the Client](#running-the-client)
4. [Contributing](#contributing)
5. [License](#license)

---

## Features

- **Server-side Processing**: Analyze cardiovascular data using advanced algorithms.
- **Client-side Visualization**: View results and insights through an interactive user interface.
- **Multi-language Support**: Codebase includes Python, Cython, and other languages for optimized performance.

---

## Prerequisites

Before running the application, make sure you have the following installed on your system:

- Python 3.8 or newer
- `pip` (Python package manager)
- Virtualenv (optional but recommended)
- Node.js and npm (if the client requires it)
- Additional dependencies listed in `requirements.txt`

---

## Setup Instructions

Follow the steps below to set up and run the application.

### Running the Server

1. **Clone the Repository**  
   Open a terminal and run:
   ```bash
   git clone https://github.com/HackerOSK/CardioHealth.git
   cd CardioHealth

2. **Creating the Venv**
   ```
   python -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
3. **Install Server Dependencies**
   ```
   pip install -r requirements.txt

4. **Run the Server**
   ```
   python server.py

The server will run on http://127.0.0.1:5000 by default. You can customize the host and port in the server.py script.


### Running the Client
1. **Navigate to the Client Directory**
   ```
   cd client
2. **Install Client Dependencies**
   ```
   npm install
3. **Run the Client**
   ```
   npm run dev

