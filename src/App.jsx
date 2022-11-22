import React, { useEffect, useRef, useState } from 'react'
import { Autocomplete, DirectionsRenderer, GoogleMap, Marker, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { useGeolocated } from "react-geolocated";
import { Button, Input, TextField, Typography } from '@mui/material';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import Icon from './icon.png'
import Geocode from "react-geocode";
Geocode.setApiKey("AIzaSyAc3i0GAN-Vzw7ZPK4FMR4RBXyKs7KTWow");

const libraries = ['places']
export default function App(props) {


  let libRef = React.useRef(libraries)

  const [map, setMap] = useState(null)
  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [destination, setdestination] = useState(null)
  const [origin, setOrgin] = useState(null)
  const [start, setStart] = useState(false)


  const originRef = useRef()
  const destiantionRef = useRef()


  const containerStyle = {
    width: '100%',
    height: '400px'
  };


  const [center, setcenter] = useState({
    lat: 28.522799,
    lng: 77.074790
  })
  const [center1, setcenter1] = useState({
    lat: 28.522799,
    lng: 77.074790
  })



  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyAc3i0GAN-Vzw7ZPK4FMR4RBXyKs7KTWow",
    libraries: libRef.current,
  })


  const findLatAndLng = async (destinvalue) => {

    const address = destinvalue

    await Geocode.fromAddress(address).then(
      (response) => {

        const res = response.results[0].geometry.location;
        console.log(res)
        let destin = {
          lat: res.lat,
          lng: res.lng
        }
        console.log(destin, "de")
        setdestination(destin)

      },
      (error) => {
        console.log(error)


      }
    );
  };

  const findLatAndLngstart = async (destinvalue) => {

    const address = destinvalue

    await Geocode.fromAddress(address).then(
      (response) => {

        const res = response.results[0].geometry.location;
        console.log(res)
        let destin = {
          lat: res.lat,
          lng: res.lng
        }
        setcenter1(destin)

      },
      (error) => {
        console.log(error)


      }
    );
  };



  const routeMapping = async (center1, destination1) => {

    if (start === true) {
      if (center !== '' && destination !== null) {
        // eslint-disable-next-line no-undef
        const directionsService = new google.maps.DirectionsService()
        const results = await directionsService.route({
          origin: center1,
          destination: destination1,
          // eslint-disable-next-line no-undef
          travelMode: google.maps.TravelMode.DRIVING,
        })
        setDirectionsResponse(results)
        setDistance(results.routes[0].legs[0].distance.text)
        setDuration(results.routes[0].legs[0].duration.text)

      }

    }

  }

  const getLiveLocation = async () => {
    navigator.geolocation.watchPosition(function (position) {
      setcenter({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      })
    });
  }

  useEffect(() => {
    getLiveLocation()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      getLiveLocation();
    }, 1000);

    return clearInterval(interval)

  }, [])


  // useEffect(() => {
  //   routeMapping(center, destination)
  // }, [center, destination])






  const handleMylocation = () => {

    navigator.geolocation.watchPosition(function (position) {
      setcenter({
        lat: position.coords.latitude,
        lng: position.coords.longitude

      })
    });

  }


  const handleFindRoute = async () => {
    
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
    findLatAndLng(destiantionRef.current.value)
    findLatAndLngstart(originRef.current.value)

  }

  const HandleClickStart = () => {

    setStart(true)
    navigator.geolocation.watchPosition(function (position) {
      setcenter({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      })
    });


  }



  return (
    <>
      <div>
        <button onClick={handleMylocation}>My location</button>
        {isLoaded ? (
          <>
            <Autocomplete>
              <input type='text' placeholder='Origin' ref={originRef}
                style={{ marginBottom: '20px', width: '100%', height: '40px', marginTop: '20px' }} />
            </Autocomplete>

            <Autocomplete>
              <input

                type='text'
                placeholder='Destination'
                ref={destiantionRef}
                style={{ marginBottom: '10px', width: '100%', height: '40px' }}
              />
            </Autocomplete>

            <Button sx={{ marginBottom: '20px' }} variant='outlined' onClick={handleFindRoute} >Find Route</Button>
            {distance !== '' && (<> <Typography>Distance Remaining:{distance}</Typography> </>)}
            {distance !== '' && (<> <Typography>Estimation Duration:{duration}</Typography> </>)}
            <Button onClick={HandleClickStart}>Start</Button>

            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center1}
              zoom={10}
              onLoad={(map) => setMap(map)}
            >
              { /* Child components, such as markers, info windows, etc. */}
              <MarkerF position={center} icon={Icon} />
              {directionsResponse && (
                <DirectionsRenderer directions={directionsResponse} >
                  <MarkerF position={center} icon={Icon} />
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
