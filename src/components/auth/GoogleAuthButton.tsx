"use client";

import React, { memo } from 'react';
import { GoogleLogin } from '@react-oauth/google';

interface GoogleAuthButtonProps {
  onSuccess: (credentialResponse: any) => void;
  onError: () => void;
  isLoading: boolean;
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
}

export const GoogleAuthButton = memo(function GoogleAuthButton({ 
  onSuccess, 
  onError, 
  isLoading,
  text = "continue_with"
}: GoogleAuthButtonProps) {
  return (
    <div className="relative flex justify-center w-full">
      <div className={`w-full flex justify-center transition-opacity duration-200 ${isLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          shape="rectangular"
          theme="outline"
          text={text}
          size="large"
        />
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
});
