"use client";

import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useState } from 'react';

export default function MarketplaceSelection() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
 
  // Domain IDs for each marketplace
  const FOOD_DOMAIN_ID = process.env.NEXT_PUBLIC_DOMAIN_ID;
  const FOOD_DEVICE_ID = process.env.NEXT_PUBLIC_DEVICE_ID;
  const FOOD_DEVICE_TOKEN = process.env.NEXT_PUBLIC_DEVICE_TOKEN;
  const ELECTRONICS_DOMAIN_ID = process.env.NEXT_PUBLIC_ELECDOMAIN_ID;
  const ELECTRONIC_DEVICE_ID = process.env.NEXT_PUBLIC_ELEDEVICE_ID;
  const ELECTRONIC_DEVICE_TOKEN = process.env.NEXT_PUBLIC_ELEDEVICE_TOKEN;
  const AUTO_DOMAIN_ID = process.env.NEXT_PUBLIC_AUTODOMAIN_ID;  
  const AUTO_DEVICE_ID = process.env.NEXT_PUBLIC_AUTODEVICE_ID;
  const AUTO_DEVICE_TOKEN = process.env.NEXT_PUBLIC_AUTODEVICE_TOKEN;


  const handleGuestLogin = async (domainId,deviceId,deviceToken) => {
    try {
      const response = await axios.post(`${BASE_URL}/user/auth/guest-login`, {
        domainId,
        deviceId,
        deviceToken,
      });
      const token = response?.data?.data?.token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('domainId',domainId)
        localStorage.setItem('deviceId',deviceId)
        localStorage.setItem('deviceToken',deviceToken)
        return true; 
      } else {
        throw new Error('No token received');
      }
    } catch (err) {
      console.error('Guest login failed:', err);
      setError('Failed to authenticate as guest. Please try again.');
      return false;
    }
  };

  const handleNavigation = async (marketplace, domainId, deviceId, deviceToken) => {
    setIsLoading(true);
    setError(null);

    const loginSuccess = await handleGuestLogin(domainId,deviceId,deviceToken);

    if (loginSuccess) {
      router.push(`/${marketplace}`);
    } else {
      console.warn(`Proceeding to ${marketplace} despite login failure.`);
      router.push(`/${marketplace}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="container">
      <h1>Select Your Marketplace</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="buttonContainer">
        <button
          onClick={() => handleNavigation('foodmarketplace', FOOD_DOMAIN_ID,FOOD_DEVICE_ID,FOOD_DEVICE_TOKEN)}
          className="p-2 bg-blue-100"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Food Marketplace'}
        </button>
        <button
          onClick={() => handleNavigation('electronicsmarketplace', ELECTRONICS_DOMAIN_ID,ELECTRONIC_DEVICE_ID,ELECTRONIC_DEVICE_TOKEN)}
          className="p-2 bg-green-100"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Electronics Marketplace'}
        </button>
        <button
          onClick={() => handleNavigation('autopartsmarketplace',AUTO_DOMAIN_ID,AUTO_DEVICE_ID,AUTO_DEVICE_TOKEN)}
          className="p-2 bg-yellow-100"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Auto Marketplace'}
        </button>
      </div>
    </div>
  );
}