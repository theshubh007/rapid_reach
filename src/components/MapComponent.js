import React from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

import { useState, useEffect, useRef } from "react"

mapboxgl.accessToken =
  "pk.eyJ1Ijoic2h1YmgzNCIsImEiOiJjbTl5bHAydmUxZmVhMnZwc3R4cm9kOG85In0.8Pq_FW4DEFn9PEwzFvk0WQ"
function MapComponent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [latitude, setLatitude] = useState(0)
  const [longitude, setLongitude] = useState(0)
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/streets-v12")
  const mapContainer = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (map.current) return // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [longitude, latitude],
      longitude: longitude,
      latitude: latitude,
      zoom: 9,
    })

    map.current.on("load", () => {
      new mapboxgl.Marker({ color: "red" })
        .setLngLat([longitude, latitude])
        .addTo(map.current)
    })

    map.current.on("load", () => {
      new mapboxgl.Marker().setLngLat([-121.89, 37.33]).addTo(map.current)
    })
  }, [mapStyle])

  useEffect(() => {
    if (map.current) {
      // Update map center
      map.current.setCenter([longitude, latitude])

      // Update marker position
      if (map.current._markers && map.current._markers.length > 0) {
        map.current._markers[0].setLngLat([longitude, latitude])
      } else {
        new mapboxgl.Marker({ color: "red" })
          .setLngLat([longitude, latitude])
          .addTo(map.current)
      }
    }
  }, [longitude, latitude])

  useEffect(() => {
    if (map.current) {
      map.current.setStyle(mapStyle)
    }
  }, [mapStyle])

  const handleSearch = async () => {
    const geocodingApiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchQuery}.json?access_token=${mapboxgl.accessToken}`

    try {
      const response = await fetch(geocodingApiUrl)
      const data = await response.json()

      if (data.features.length > 0) {
        const coordinates = data.features[0].center
        map.current.flyTo({
          center: coordinates,
          zoom: 12,
        })
      } else {
        alert("Location not found")
      }
    } catch (error) {
      console.error("Error searching for location:", error)
      alert("Error searching for location")
    }
  }

  return (
    <div>
      <input
        type="number"
        placeholder="Latitude"
        value={latitude}
        onChange={(e) => {
          const value = parseFloat(e.target.value)
          if (value >= -90 && value <= 90) {
            setLatitude(value)
          } else if (isNaN(value)) {
            setLatitude(0)
          } else {
            alert("Latitude must be between -90 and 90")
          }
        }}
      />
      <input
        type="number"
        placeholder="Longitude"
        value={longitude}
        onChange={(e) => {
          const value = parseFloat(e.target.value)
          if (value >= -180 && value <= 180) {
            setLongitude(value)
          } else if (isNaN(value)) {
            setLongitude(0)
          } else {
            alert("Longitude must be between -180 and 180")
          }
        }}
      />
      <input
        type="text"
        placeholder="Search location"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            handleSearch()
          }
        }}
      />
      <select value={mapStyle} onChange={(e) => setMapStyle(e.target.value)}>
        <option value="mapbox://styles/mapbox/streets-v12">Streets</option>
        <option value="mapbox://styles/mapbox/satellite-v9">Satellite</option>
        <option value="mapbox://styles/mapbox/dark-v11">Dark</option>
        <option value="mapbox://styles/mapbox/light-v11">Light</option>
      </select>
      <div ref={mapContainer} style={{ height: "400px", width: "100vw" }} />
    </div>
  )
}

export default MapComponent
