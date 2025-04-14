import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebookF, faGithub } from '@fortawesome/free-brands-svg-icons';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(true);

  useEffect(() => {
    const glitterContainer = document.getElementById('glitterContainer');
    for (let i = 0; i < 150; i++) {
      const glitter = document.createElement('div');
      glitter.className = 'glitter';
      glitter.style.top = `${Math.random() * 100}%`;
      glitter.style.left = `${Math.random() * 100}%`;
      glitter.style.animation = `glitter ${1 + Math.random()}s infinite alternate ease-in-out`;
      glitterContainer.appendChild(glitter);
    }
  }, []);

  const toggleAuth = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-pink-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg"></div>
      <div className="absolute inset-0 bg-radial-gradient"></div>
      
      <div id="glitterContainer" className="absolute inset-0 pointer-events-none overflow-hidden"></div>
      
      <div className="relative w-96 p-8 bg-white bg-opacity-30 backdrop-filter backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.6)] rounded-2xl border border-white border-opacity-50 text-center text-white animate-fadeIn">
        <h2 className="text-2xl font-bold mb-6">{isSignUp ? 'Sign Up' : 'Log In'}</h2>

        <form>
          {isSignUp && (
            <div className="mb-3 animate-fadeInDown">
              <input type="text" placeholder="Full Name" className="w-full p-3 mb-3 bg-white bg-opacity-40 border-none rounded text-purple-900 font-semibold placeholder-purple-700 placeholder-opacity-80" />
            </div>
          )}
          <input type="email" placeholder="Email" className="w-full p-3 mb-3 bg-white bg-opacity-40 border-none rounded text-purple-900 font-semibold placeholder-purple-700 placeholder-opacity-80" />
          <input type="password" placeholder="Password" className="w-full p-3 mb-3 bg-white bg-opacity-40 border-none rounded text-purple-900 font-semibold placeholder-purple-700 placeholder-opacity-80" />
           
              <Link to="/dashboard" className="w-full">
          <button type="button" className="w-full p-3 bg-purple-500 border-none rounded text-white font-bold cursor-pointer transition-colors duration-300 hover:bg-purple-700 shadow-md">
            {isSignUp ? 'Create Account' : 'Login'}
          </button>
          </Link>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-white bg-opacity-50"></div>
          <span className="mx-4 text-white text-opacity-70 font-semibold">or</span>
          <div className="flex-1 h-px bg-white bg-opacity-50"></div>
        </div>

        <div className="flex justify-center gap-4">
          <button className="flex items-center gap-2 p-2 px-3 bg-white bg-opacity-40 text-purple-900 border-none rounded font-semibold cursor-pointer transition-colors duration-300 hover:bg-opacity-50">
            <FontAwesomeIcon icon={faGoogle} size="lg" />
            Google
          </button>
          <button className="flex items-center gap-2 p-2 px-3 bg-white bg-opacity-40 text-purple-900 border-none rounded font-semibold cursor-pointer transition-colors duration-300 hover:bg-opacity-50">
            <FontAwesomeIcon icon={faFacebookF} size="lg" />
            Facebook
          </button>
          <button className="flex items-center gap-2 p-2 px-3 bg-white bg-opacity-40 text-purple-900 border-none rounded font-semibold cursor-pointer transition-colors duration-300 hover:bg-opacity-50">
            <FontAwesomeIcon icon={faGithub} size="lg" />
            GitHub
          </button>
        </div>

        <div className="mt-4 text-white text-opacity-90 cursor-pointer animate-slideUp" onClick={toggleAuth}>
          {isSignUp ? 'Already have an account? Log in' : 'Don\'t have an account? Sign up'}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
