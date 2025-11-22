# An Emergency Vehicle Traffic Management System

This project is a full-stack traffic management simulation designed to facilitate the flow of emergency vehicles through city traffic. It features a React-based frontend for user interaction and a Python-based backend that uses SUMO (Simulation of Urban MObility) to run a detailed traffic simulation.

## System Architecture

The project consists of two main components:

1.  **Frontend (`corridor-flow-pilot-main`)**: A web application built with React, TypeScript, and Vite. It provides dashboards for various users, such as:
    *   **Ambulance Drivers**: Can start the simulation and view their route.
    *   **108 Server Operators**: Can dispatch ambulances.
    *   **Traffic Police**: Can monitor traffic and ambulance movements.

2.  **Backend (`Emergency_Traffic_Simulation`)**: A Python server using Flask and Socket.IO. It receives commands from the frontend to:
    *   Launch a `sumo-gui` instance for visualization.
    *   Control the simulation using the TraCI API to implement a "green corridor" for the emergency vehicle by controlling traffic lights.

## Technologies Used

| Category      | Technology                                    |
|---------------|-----------------------------------------------|
| **Frontend**  | React, TypeScript, Vite, Tailwind CSS, shadcn-ui|
| **Backend**   | Python, Flask, Flask-SocketIO                 |
| **Simulation**| SUMO (Simulation of Urban MObility)           |

## Prerequisites

Before you begin, ensure you have the following installed on your system:

1.  **Node.js and npm**: [Download & Install Node.js](https://nodejs.org/) (which includes npm).
2.  **Python**: [Download & Install Python](https://www.python.org/downloads/).
3.  **SUMO**: [Download & Install SUMO](https://www.eclipse.org/sumo/docs/Downloads.php).
    *   **Important**: Make sure the `sumo/bin` directory is added to your system's PATH so that the `sumo-gui` command is accessible from the terminal.

## Installation

First, clone the repository to your local machine. Then, install the dependencies for both the frontend and backend.

1.  **Clone the repository:**
    ```sh
    git clone <YOUR_GIT_URL>
    ```

2.  **Install Frontend Dependencies:**
    Navigate to the frontend directory and install the required npm packages.
    ```sh
    cd corridor-flow-pilot-main
    npm install
    ```

3.  **Install Backend Dependencies:**
    Navigate to the backend directory and install the required Python packages using `pip`.
    ```sh
    cd ../Emergency_Traffic_Simulation
    pip install -r requirements.txt
    ```

## Running the Application

To run the full application, you must start the backend server first, and then the frontend development server.

### Step 1: Start the Backend Server

1.  Navigate to the backend `src` directory:
    ```sh
    cd Emergency_Traffic_Simulation/src
    ```

2.  Run the Flask application:
    ```sh
    python app.py
    ```

    This will start the backend server on `http://localhost:5000`. You should see output indicating that the Flask server and Socket.IO are running.

### Step 2: Start the Frontend Server

1.  Open a **new terminal** and navigate to the frontend directory:
    ```sh
    cd corridor-flow-pilot-main
    ```

2.  Start the Vite development server:
    ```sh
    npm run dev
    ```

    This will start the frontend application, typically on `http://localhost:5173`. Your browser should open to this address.

### Step 3: Run the Simulation

1.  In the web application, navigate to the **Ambulance Driver Login**.
2.  After logging in, you will be on the **Ambulance Driver Dashboard**.
3.  Click the button to **start the simulation**. This will trigger the backend to launch the SUMO GUI and begin the emergency corridor simulation.

## Folder Structure

The repository is organized into two main project folders:

-   `corridor-flow-pilot-main/`: Contains the React frontend application.
-   `Emergency_Traffic_Simulation/`: Contains the Python backend and SUMO simulation files.
