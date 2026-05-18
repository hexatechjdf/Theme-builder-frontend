import React, { useEffect } from 'react';
import { Box, Heading } from '@chakra-ui/react';

const Test: React.FC = () => {
  useEffect(() => {
    const verifyOtp = async () => {
      try {
        const response = await fetch('https://fruity-suits-buy.loca.lt/api/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            otp: 'HZK$kCwjSW0s', // Replace with your real OTP
            email: 'paul@leadbosscrm.com', // Include email if your API expects it
          }),
        });

        const data = await response.json();
        console.log('API Response:', data);
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    verifyOtp();
  }, []);

  return (
    <Box p={4}>
      <Heading size="md">Check the console for API response</Heading>
    </Box>
  );
};

export default Test;
