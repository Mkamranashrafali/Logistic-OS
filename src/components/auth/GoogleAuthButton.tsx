"use client";

import React, { memo, useState, useEffect } from 'react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative flex justify-center w-full min-h-[40px]">
      {!mounted ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-md animate-pulse border border-slate-200">
          <span className="text-sm font-medium text-slate-400">Loading Google...</span>
        </div>
      ) : (
        <div className={`w-full flex justify-center transition-opacity duration-200 ${isLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
          <GoogleLogin
            onSuccess={onSuccess}
            onError={onError}
            shape="rectangular"
            theme="outline"
            text={text}
            size="large"
            useOneTap={false}
            auto_select={false}
          />
        </div>
      )}
      
      {isLoading && mounted && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-white/50 rounded-md">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
});
