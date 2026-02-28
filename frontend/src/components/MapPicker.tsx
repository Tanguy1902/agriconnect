"use client";

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  readOnly?: boolean;
}

function LocationMarker({ lat, lng, onLocationSelect, readOnly }: MapPickerProps & { lat: number; lng: number }) {
  useMapEvents({
    click(e) {
      if (!readOnly) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return lat !== 0 && lng !== 0 ? (
    <Marker position={[lat, lng]} />
  ) : null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function MapPicker({ initialLat, initialLng, onLocationSelect, readOnly = false }: MapPickerProps) {
  const [lat, setLat] = useState(initialLat || -18.8792); // Default to Antananarivo
  const [lng, setLng] = useState(initialLng || 47.5079);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) {
      setTimeout(() => setIsMounted(true), 0);
    }
  }, [isMounted]);

  // Use a ref to track if we've already set the initial coordinates from props
  const initialSet = React.useRef(false);

  useEffect(() => {
    if (!initialSet.current && initialLat && initialLng) {
      setTimeout(() => {
        if (lat !== initialLat) setLat(initialLat);
        if (lng !== initialLng) setLng(initialLng);
      }, 0);
      initialSet.current = true;
    }
  }, [initialLat, initialLng, lat, lng]);

  const handleLocationSelect = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    onLocationSelect(newLat, newLng);
  };

  if (!isMounted) return <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center">Chargement de la carte...</div>;

  return (
    <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 z-0">
      <MapContainer 
        center={[lat, lng]} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker 
          lat={lat} 
          lng={lng} 
          onLocationSelect={handleLocationSelect} 
          readOnly={readOnly} 
        />
        <ChangeView center={[lat, lng]} />
      </MapContainer>
    </div>
  );
}
