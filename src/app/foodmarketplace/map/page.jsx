"use client"

import { useEffect, useRef, useState } from "react"

export default function Map() {
  const mapRef = useRef(null)
  const [location, setLocation] = useState(null)
  const [address, setAddress] = useState("")

  useEffect(() => {
    const loadMapScript = () => {
      const existingScript = document.getElementById("googleMaps")
      if (!existingScript) {
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDKMCAhQa8UySb1QkwkmdDPVUPhj7DAgBQ`
        script.id = "googleMaps"
        script.async = true
        script.onload = initMap
        document.body.appendChild(script)
      } else {
        initMap()
      }
    }

    loadMapScript()
  }, [])

  function initMap() {
    if (!mapRef.current || !window.google) return

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 28.6139, lng: 77.209 }, // Delhi
      zoom: 10,
    })

    let marker

    map.addListener("click", (e) => {
      const clickedLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      }

      setLocation(clickedLocation)

      if (marker) marker.setMap(null)

      marker = new window.google.maps.Marker({
        position: clickedLocation,
        map: map,
      })

      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ location: clickedLocation }, (results, status) => {
        if (status === "OK" && results[0]) {
          setAddress(results[0].formatted_address)
        } else {
          setAddress("Address not found.")
        }
      })
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <div ref={mapRef} className="w-full max-w-4xl h-[500px] rounded shadow-md" />
      {location && (
        <div className="text-center">
          <p className="font-semibold">Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
          <p className="text-sm text-gray-600 mt-1">📍 {address}</p>
        </div>
      )}
    </div>
  )
}
