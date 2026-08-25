import { useState, useEffect, useCallback } from 'react';
import { Coordinates } from '../types';

export interface GeolocationState {
  coords: Coordinates | null;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number | null;
  error: string | null;
  isWatching: boolean;
  isLoading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    accuracy: null,
    speed: null,
    heading: null,
    timestamp: null,
    error: null,
    isWatching: false,
    isLoading: false,
  });

  // Single shot current position
  const getCurrentPosition = useCallback((): Promise<Coordinates> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = 'La geolocalización no está soportada por este navegador.';
        setState(prev => ({ ...prev, error: err, isLoading: false }));
        reject(new Error(err));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setState({
            coords,
            accuracy: pos.coords.accuracy,
            speed: pos.coords.speed,
            heading: pos.coords.heading,
            timestamp: pos.timestamp,
            error: null,
            isWatching: false,
            isLoading: false,
          });
          resolve(coords);
        },
        (err) => {
          let msg = 'No se pudo obtener la ubicación GPS.';
          if (err.code === 1) msg = 'Permiso de ubicación denegado. Activá el GPS en tu navegador.';
          else if (err.code === 2) msg = 'Ubicación no disponible en este momento.';
          else if (err.code === 3) msg = 'Tiempo de espera agotado al obtener el GPS.';

          setState(prev => ({ ...prev, error: msg, isLoading: false }));
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 3000,
        }
      );
    });
  }, []);

  // Continuous watch
  const startWatch = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'GPS no soportado' }));
      return;
    }

    setState(prev => ({ ...prev, isWatching: true, error: null }));

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          coords: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          timestamp: pos.timestamp,
          error: null,
          isWatching: true,
          isLoading: false,
        });
      },
      (err) => {
        setState(prev => ({ ...prev, error: err.message }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setState(prev => ({ ...prev, isWatching: false }));
    };
  }, []);

  return {
    ...state,
    getCurrentPosition,
    startWatch
  };
}
