# Grievances App

A fun, casual web application that allows your friend group to submit grievances to each other, either anonymously or not. Built with Next.js, Firebase, and Tailwind CSS.

## Features

- 🔐 User authentication (signup/login)
- 📝 Send grievances to your friends
- 🕵️ Option to send anonymously
- 📊 Dashboard to view received grievances
- 📋 Separate pages for sent and received grievances
- 🎨 Modern, clean, and fun UI design

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **Deployment**: Vercel

## Setup Instructions

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- A Firebase account (free tier is sufficient)
- A Vercel account (free tier is sufficient)

### 1. Setting up Firebase

1. **Create a Firebase Project**:
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project" and follow the setup steps
   - Give your project a name (e.g., "grievances-app")

2. **Enable Authentication**:
   - Within your Firebase project, go to "Authentication" in the sidebar
   - Click "Get Started"
   - Enable the "Email/Password" sign-in method

3. **Create a Firestore Database**:
   - Go to "Firestore Database" in the sidebar
   - Click "Create Database"
   - Choose "Start in test mode" for easy setup (you can adjust security rules later)
   - Select a location closest to you

4. **Get Firebase Configuration**:
   - Go to Project Settings (gear icon near the top of the sidebar)
   - Scroll down to "Your apps" section
   - If you don't have an app, click the web icon (`</>`) to create one
   - Register your app with a nickname (e.g., "grievances-web")
   - Copy the Firebase configuration object (it looks like this):
     ```js
     const firebaseConfig = {
       apiKey: "...",
       authDomain: "...",
       projectId: "...",
       storageBucket: "...",
       messagingSenderId: "...",
       appId: "..."
     };
     ```

### 2. Setting up the Local Development Environment

1. **Clone the repository** (if you're using version control):
   ```bash
   git clone <repository-url>
   cd grievances
   ```

   Or just navigate to your project directory if you already have the code.

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment variables**:
   Create a `.env.local` file in the root of your project with the following content:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
   Replace the values with the ones from your Firebase configuration.

4. **Run the development server**:
   ```bash
   npm run dev
   ```

   The application will be available at http://localhost:3000

### 3. Deploying to Vercel

1. **Create a Vercel Account**:
   - Go to [Vercel](https://vercel.com/) and sign up if you don't have an account

2. **Deploy from GitHub** (if your code is on GitHub):
   - Push your code to a GitHub repository
   - Go to the Vercel dashboard and click "New Project"
   - Import your repository
   - In the configuration step, add the same environment variables you used in the `.env.local` file
   - Click "Deploy"

3. **Deploy from CLI** (alternative method):
   - Install the Vercel CLI:
     ```bash
     npm install -g vercel
     ```
   - Navigate to your project directory and run:
     ```bash
     vercel
     ```
   - Follow the prompts to log in and configure your project
   - When asked about environment variables, add all the Firebase config values

4. **Setting Up Custom Domain** (optional):
   - From your Vercel project dashboard, go to "Settings" > "Domains"
   - Add your custom domain and follow the instructions to configure DNS

### 4. Post-Deployment Setup

1. **Update Firebase Security Rules**:
   - Go to your Firebase Console
   - Navigate to "Firestore Database" > "Rules"
   - Update the rules to secure your database. For example:
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /users/{userId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
         match /grievances/{grievanceId} {
           allow create: if request.auth != null;
           allow read, update, delete: if request.auth != null && 
             (resource.data.senderUid == request.auth.uid || 
              resource.data.recipientUid == request.auth.uid);
         }
       }
     }
     ```

## Usage

1. **Sign Up / Log In**:
   - Create an account or log in to your existing account
   - Each user gets a unique profile

2. **Dashboard**:
   - View your recent grievances at a glance
   - See statistics about received grievances

3. **Send a Grievance**:
   - Select a friend from the dropdown
   - Write your grievance
   - Choose whether to send anonymously or not
   - Submit your grievance

4. **Manage Grievances**:
   - View all received and sent grievances
   - Mark grievances as read
   - Delete grievances you no longer want

## Troubleshooting

- **Authentication Issues**:
  - Make sure your Firebase Authentication service is properly enabled
  - Check that your environment variables are correctly set

- **Database Connection Issues**:
  - Verify your Firebase project ID and API keys
  - Check Firebase Console for any service disruptions

- **Deployment Issues**:
  - Ensure all environment variables are set in your Vercel project
  - Check the build logs for any errors

## Contributing

If you'd like to contribute to this project, please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is for personal use within your friend group. Please respect the privacy of users and do not use this application for harmful purposes.