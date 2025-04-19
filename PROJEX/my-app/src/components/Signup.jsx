// AuthPage.jsx
import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { auth } from "../firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";

const AuthPage = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleSignIn, setIsGoogleSignIn] = useState(false);

  useEffect(() => {
    const glitterContainer = document.getElementById("glitterContainer");
    for (let i = 0; i < 150; i++) {
      const glitter = document.createElement("div");
      glitter.className = "glitter";
      glitter.style.top = `${Math.random() * 100}%`;
      glitter.style.left = `${Math.random() * 100}%`;
      glitter.style.animation = `glitter ${
        1 + Math.random()
      }s infinite alternate ease-in-out`;
      glitterContainer.appendChild(glitter);
    }
  }, []);

  useEffect(() => {
    // Reset loading state if user navigates away or component unmounts
    return () => {
      setIsLoading(false);
      setIsGoogleSignIn(false);
    };
  }, []);

  const toggleAuth = () => {
    setIsSignUp(!isSignUp);
    setError("");
  };

  // Handle standard email/password authentication
  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Basic validation
    if (!email || !password || (isSignUp && !name)) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Create user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        // Update profile with name
        await updateProfile(userCredential.user, {
          displayName: name,
        });
        navigate("/dashboard");
      } else {
        // Sign in user
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/dashboard");
      }
    } catch (error) {
      // Handle specific error cases with user-friendly messages
      switch (error.code) {
        case "auth/email-already-in-use":
          setError("This email is already registered. Please log in instead.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        case "auth/weak-password":
          setError("Password should be at least 6 characters.");
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
          setError("Invalid email or password.");
          break;
        default:
          setError(error.message);
      }
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setError("");
    setIsGoogleSignIn(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      if (result?.user) {
        navigate("/dashboard");
      }
    } catch (error) {
      // Handle popup closed immediately
      if (error.code === "auth/popup-closed-by-user") {
        setError("Sign-in was canceled. Please try again.");
      } else {
        handleSocialAuthError(error);
      }
    } finally {
      setIsGoogleSignIn(false);
    }
  };

  // Common error handler for social authentication
  const handleSocialAuthError = (error) => {
    if (error.code === "auth/account-exists-with-different-credential") {
      // Use a safer approach that won't throw additional errors
      const email = error.customData?.email || "your account";

      // Start this as a separate async operation to avoid blocking
      fetchSignInMethodsForEmail(auth, email)
        .then((methods) => {
          let authMethod = "another method";
          if (methods && methods.length > 0) {
            // Convert the provider ID to a user-friendly name
            switch (methods[0]) {
              case "password":
                authMethod = "email and password";
                break;
              case "google.com":
                authMethod = "Google";
                break;
              default:
                authMethod = methods[0];
            }
          }

          setError(
            `An account already exists with the email ${email}. Please sign in with ${authMethod}.`
          );
        })
        .catch((fetchError) => {
          console.error("Error fetching sign-in methods:", fetchError);
          setError(
            "An account already exists with this email. Please try another login method."
          );
        });
    } else if (error.code === "auth/popup-closed-by-user") {
      setError("Sign-in was canceled. Please try again.");
    } else {
      console.error("Social sign-in error:", error);
      setError(error.message || "Authentication failed. Please try again.");
    }
  };

  // Handle password reset
  const handleForgotPassword = async () => {
    // Clear any previous errors
    setError("");

    // Check if email is provided
    if (!email || email.trim() === "") {
      setError("Please enter your email address first");
      return;
    }

    // Basic email validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent. Please check your inbox.");
    } catch (error) {
      console.error("Password reset error:", error);

      // Handle specific error cases
      switch (error.code) {
        case "auth/invalid-email":
          setError("Invalid email format. Please check your email address.");
          break;
        case "auth/user-not-found":
          setError("No account found with this email address.");
          break;
        default:
          setError(`Failed to send reset email: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-pink-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg"></div>
      <div className="absolute inset-0 bg-radial-gradient"></div>

      <div
        id="glitterContainer"
        className="absolute inset-0 pointer-events-none overflow-hidden"
      ></div>

      <div className="relative w-96 p-8 bg-white bg-opacity-30 backdrop-filter backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.6)] rounded-2xl border border-white border-opacity-50 text-center text-white animate-fadeIn">
        <h2 className="text-2xl font-bold mb-6">
          {isSignUp ? "Sign Up" : "Log In"}
        </h2>

        {error && (
          <div className="mb-4 p-2 bg-red-500 bg-opacity-40 rounded text-white text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth}>
          {isSignUp && (
            <div className="mb-3 animate-fadeInDown">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 mb-3 bg-white bg-opacity-40 border-none rounded text-purple-900 font-semibold placeholder-purple-700 placeholder-opacity-80"
                disabled={isLoading}
              />
            </div>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-3 bg-white bg-opacity-40 border-none rounded text-purple-900 font-semibold placeholder-purple-700 placeholder-opacity-80"
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-3 bg-white bg-opacity-40 border-none rounded text-purple-900 font-semibold placeholder-purple-700 placeholder-opacity-80"
            disabled={isLoading}
          />

          <button
            type="submit"
            className={`w-full p-3 bg-purple-500 border-none rounded text-white font-bold cursor-pointer transition-colors duration-300 hover:bg-purple-700 shadow-md ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading
              ? "Processing..."
              : isSignUp
              ? "Create Account"
              : "Login"}
          </button>

          {!isSignUp && (
            <div className="text-right mt-2">
              <span
                className="text-sm text-white underline cursor-pointer"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </span>
            </div>
          )}
        </form>

        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-white bg-opacity-50"></div>
          <span className="mx-4 text-white text-opacity-70 font-semibold">
            or
          </span>
          <div className="flex-1 h-px bg-white bg-opacity-50"></div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center gap-2 p-2 px-3 bg-white bg-opacity-40 text-purple-900 border-none rounded font-semibold cursor-pointer transition-colors duration-300 hover:bg-opacity-50"
          >
            <FontAwesomeIcon icon={faGoogle} size="lg" />
            {isGoogleSignIn ? "Connecting..." : "Google"}
          </button>
        </div>

        <div
          className="mt-4 text-white text-opacity-90 cursor-pointer animate-slideUp"
          onClick={toggleAuth}
        >
          {isSignUp
            ? "Already have an account? Log in"
            : "Don't have an account? Sign up"}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
