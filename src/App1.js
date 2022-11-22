import React, { useEffect, useRef, useState } from 'react'
import { Autocomplete, DirectionsRenderer, GoogleMap, Marker, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { useGeolocated } from "react-geolocated";
import { Button } from '@mui/material';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';


const AnyReactComponent = ({ text }) => <div>{text}</div>;
export default function App(props) {


  const [map, setMap] = useState(null)
  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')


  const originRef = useRef()
  const destiantionRef = useRef()


  const containerStyle = {
    width: '400px',
    height: '400px'
  };


  const [center, setcenter] = useState({
    lat: 28.522799,
    lng: 77.074790
  })


  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyAc3i0GAN-Vzw7ZPK4FMR4RBXyKs7KTWow",
    libraries:['places']
  })


const getLiveLocation =()=>
{
  navigator.geolocation.watchPosition(function (position) {
console.log(position)
    setcenter({
      lat: position.coords.latitude,
      lng: position.coords.longitude

    })

  });
}

useEffect(()=>{
  getLiveLocation()
},[])

  useEffect(() => {

    const interval = setInterval(() => {
      getLiveLocation()
      
    }, 1000);

    return clearInterval(interval)

    

  })

  const handleMylocation = () => {

    navigator.geolocation.watchPosition(function (position) {          
      setcenter({
        lat: position.coords.latitude,
        lng: position.coords.longitude

      })
    });

  }


  const handleFindRoute = async()=>{
    if (originRef.current.value === '' || destiantionRef.current.value === '') {
      return
    }
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService()
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destiantionRef.current.value,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    })
    setDirectionsResponse(results)
    setDistance(results.routes[0].legs[0].distance.text)
    setDuration(results.routes[0].legs[0].duration.text)
  }



  return (
    <>
      <div>
        <button onClick={handleMylocation}>My location</button>
        {isLoaded ? (
          <>
            <Autocomplete>
              <input type='text' placeholder='Origin' ref={originRef} />
            </Autocomplete>

            <Autocomplete>
              <input
                type='text'
                placeholder='Destination'
                ref={destiantionRef}
              />
            </Autocomplete>

            <Button onClick={handleFindRoute} >Route</Button>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={10}
              onLoad={(map) => setMap(map)}
            // onUnmount={onUnmount}
            >
              { /* Child components, such as markers, info windows, etc. */}
              <MarkerF position={center} />


              {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} >
              <MarkerF position={center}    >
                
                </MarkerF>

              

              </DirectionsRenderer>
          )}
              <></>
            </GoogleMap>
          </>

        ) : <></>}
      </div>
    </>
  )
}
