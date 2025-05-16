import { useState, useEffect } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export const useFingerprint = () => {
  const [fingerprint, setFingerprint] = useState(null);

  useEffect(() => {
    const loadFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setFingerprint(result.visitorId);
    };
    loadFingerprint();
  }, []);

  return fingerprint;
};
