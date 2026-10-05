const MESSAGES = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "No account found with this email.",
  "auth/email-already-in-use": "An account with this email already exists. Please sign in instead.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "Network error. Please check your connection.",
  "auth/invalid-api-key": "The Firebase API key is invalid. Check the environment variables.",
  "auth/operation-not-allowed": "Email/password sign-in is not enabled in the Firebase Console.",
  "permission-denied": "You do not have permission to do that.",
};

export const friendlyError = (e) => MESSAGES[e?.code] || e?.message || "Something went wrong. Please try again.";
