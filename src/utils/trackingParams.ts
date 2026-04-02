interface TrackingParams {
  gclid: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
}

const TRACKING_STORAGE_KEY = 'tracking_params';

export const getTrackingParams = (): TrackingParams => {
  const stored = localStorage.getItem(TRACKING_STORAGE_KEY);

  if (stored) {
    try {
      return JSON.parse(stored) as TrackingParams;
    } catch {
      // If parse fails, return empty params
    }
  }

  return {
    gclid: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_content: '',
    utm_term: '',
  };
};

export const captureTrackingParams = (): void => {
  const urlParams = new URLSearchParams(window.location.search);
  const existing = getTrackingParams();

  const trackingParams: TrackingParams = {
    gclid: urlParams.get('gclid') || existing.gclid || '',
    utm_source: urlParams.get('utm_source') || existing.utm_source || '',
    utm_medium: urlParams.get('utm_medium') || existing.utm_medium || '',
    utm_campaign: urlParams.get('utm_campaign') || existing.utm_campaign || '',
    utm_content: urlParams.get('utm_content') || existing.utm_content || '',
    utm_term: urlParams.get('utm_term') || existing.utm_term || '',
  };

  localStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(trackingParams));
};