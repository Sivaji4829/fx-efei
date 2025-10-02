FutureX 2025 - Escape from the Error Island
This is a frontend-only prototype for a technical event web application built with React, Vite, and TailwindCSS.

How to Install & Run the Project
Prerequisites: Make sure you have Node.js and npm installed on your machine.

Clone or Download: Get the project files onto your local machine.

Install Dependencies: Open your terminal, navigate to the project's root directory (escape-error-island/), and run the following command:

npm install

Start the Development Server: Once the dependencies are installed, start the Vite development server:

npm run dev

Open in Browser: The terminal will show a local URL (usually http://localhost:5173). Open this URL in your web browser to use the application.

Project Overview & Features
Login System: Uses a Unique ID (UID) to grant access. UIDs are stored in localStorage to prevent reuse, simulating a single-use test link.

Multi-Round Structure: A three-level event flow with MCQs and coding challenges.

Conditional Progression: Participants must score above a certain threshold to advance to the final round.

Anti-Cheat System: The application has several built-in mechanisms to deter cheating:

It terminates the test if the user exits fullscreen mode.

It terminates if the user opens developer tools.

It terminates if the user switches browser tabs.

It disables right-clicking, copy, paste, and cut functionalities.

Auto-Evaluation: JavaScript code submissions are automatically evaluated against predefined test cases. Other languages are accepted for manual review.

Timer: Each round is timed to create a sense of urgency.

Limitations of this Prototype
Frontend-Only: This is a prototype and does not have a backend. All data (like UIDs and scores) is stored in the browser's localStorage, which is not secure and can be easily cleared or manipulated by the user.

No Real Database: localStorage is used to simulate a database for used UIDs. For a production application, a secure backend and database (e.g., Node.js + PostgreSQL, Firebase) are essential.

Code Evaluation: The JavaScript evaluation uses new Function(), which is a form of eval(). While placed in a try...catch block, it is not a fully secure sandbox. A production system should use a dedicated, isolated environment (like a Docker container) to run user-submitted code safely.

Styling: TailwindCSS is loaded via a CDN for simplicity, as requested. For a production build, it's recommended to integrate Tailwind as a PostCSS plugin for better performance and features like purging unused styles."# fx-efei" 
