'use client';

import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { useTheme } from 'next-themes';
import { forwardRef } from 'react';
import { environment } from '@/configs/environment';

interface CaptchaTurnstileProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

const CaptchaTurnstile = forwardRef<TurnstileInstance, CaptchaTurnstileProps>(
  ({ onSuccess, onError, onExpire }, ref) => {
    const { resolvedTheme } = useTheme();

    return (
      <Turnstile
        ref={ref}
        siteKey={environment.TURNSTILE_SITE_KEY}
        options={{
          theme: resolvedTheme === 'dark' ? 'dark' : 'light',
          size: 'normal',
        }}
        onSuccess={onSuccess}
        onError={onError}
        onExpire={onExpire}
      />
    );
  }
);

CaptchaTurnstile.displayName = 'CaptchaTurnstile';

export default CaptchaTurnstile;
