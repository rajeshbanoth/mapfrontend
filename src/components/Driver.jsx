import React, { useEffect, useRef, useState } from 'react'
import { Autocomplete, DirectionsRenderer, GoogleMap, Marker, MarkerClusterer, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { Button, Input, TextField, Typography } from '@mui/material';
import Icon from './icon.png'
import Geocode from "react-geocode";
import io from 'socket.io-client'
Geocode.setApiKey("AIzaSyAc3i0GAN-Vzw7ZPK4FMR4RBXyKs7KTWow");
const socket = io.connect("https://livetrackingapp.herokuapp.com/")

const libraries = ['places']
export default function Driver(props) {


  let libRef = React.useRef(libraries)


  
  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [destination, setdestination] = useState(null)
const  [map,setMap]=useState(null)

  const [center, setcenter] = useState({
    lat: 28.522799,
    lng: 77.074790
  })
  const [center1, setcenter1] = useState({
    lat: 28.522799,
    lng: 77.074790
  })


  const originRef = useRef()
  const destiantionRef = useRef()
  const markerRef = useRef(null);
  const mapRef = React.useRef(null);


  const containerStyle = {
    width: '100%',
    height: '400px'
  };




  function animateMarkerTo(marker, newPosition) {
    var options = {
      duration: 1000,
      easing: function (x, t, b, c, d) {
        // jquery animation: swing (easeOutQuad)
        return -c * (t /= d) * (t - 2) + b;
      }
    };

    window.requestAnimationFrame =
      window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.msRequestAnimationFrame;
    window.cancelAnimationFrame =
      window.cancelAnimationFrame || window.mozCancelAnimationFrame;

    // save current position. prefixed to avoid name collisions. separate for lat/lng to avoid calling lat()/lng() in every frame
    marker.AT_startPosition_lat = marker.getPosition().lat();
    marker.AT_startPosition_lng = marker.getPosition().lng();
    var newPosition_lat = newPosition.lat;
    var newPosition_lng = newPosition.lng;

    // crossing the 180° meridian and going the long way around the earth?
    if (Math.abs(newPosition_lng - marker.AT_startPosition_lng) > 180) {
      if (newPosition_lng > marker.AT_startPosition_lng) {
        newPosition_lng -= 360;
      } else {
        newPosition_lng += 360;
      }
    }


    var animateStep = function (marker, startTime) {
      var ellapsedTime = new Date().getTime() - startTime;
      var durationRatio = ellapsedTime / options.duration; // 0 - 1
      var easingDurationRatio = options.easing(
        durationRatio,
        ellapsedTime,
        0,
        1,
        options.duration
      );

      if (durationRatio < 1) {
        marker.setPosition({
          lat:
            marker.AT_startPosition_lat +
            (newPosition_lat - marker.AT_startPosition_lat) * easingDurationRatio,
          lng:
            marker.AT_startPosition_lng +
            (newPosition_lng - marker.AT_startPosition_lng) * easingDurationRatio
        });

        // use requestAnimationFrame if it exists on this browser. If not, use setTimeout with ~60 fps
        if (window.requestAnimationFrame) {
          marker.AT_animationHandler = window.requestAnimationFrame(function () {
            animateStep(marker, startTime);
          });
        } else {
          marker.AT_animationHandler = setTimeout(function () {
            animateStep(marker, startTime);
          }, 17);
        }
      } else {
        marker.setPosition(newPosition);
      }
    };

    // stop possibly running animation
    if (window.cancelAnimationFrame) {
      window.cancelAnimationFrame(marker.AT_animationHandler);
    } else {
      clearTimeout(marker.AT_animationHandler);
    }

    animateStep(marker, new Date().getTime());
  }

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

  const getLiveLocation = async () => {
    navigator.geolocation.watchPosition(function (position) {
      let  driver_position = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      animateMarkerTo(markerRef.current.marker, driver_position)


      setcenter({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      })
     
      socket.emit("send_driver_location",{driver_position})
    });
  }

  useEffect(() => {
    getLiveLocation()
  }, [])

  useEffect(() => {

    const interval = setInterval(() => {
      getLiveLocation();
    }, 4000);

    return clearInterval(interval)

  }, [])



  const handleMylocation = () => {
    navigator.geolocation.watchPosition(function (position) {
      let position1 = {
        lat: position.coords.latitude,
        lng: position.coords.longitude

      }
      animateMarkerTo(markerRef.current.marker, position1)
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
    const distance=results.routes[0].legs[0].distance.text
    const time=results.routes[0].legs[0].duration.text
 
    setDirectionsResponse(results)
    setDistance(results.routes[0].legs[0].distance.text)
    setDuration(results.routes[0].legs[0].duration.text)

    socket.emit("send_driver_route",{results,distance,time})
    // findLatAndLng(destiantionRef.current.value)
    // findLatAndLngstart(originRef.current.value)

  }



  const onClick = React.useCallback((event) => {
    console.log(event.latLng)
    animateMarkerTo(markerRef.current.marker, event.latLng);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    mapRef.current = null;
  }, []);






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


            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center1}
              zoom={10}
              onLoad={(map) => setMap(map)}

              onUnmount={onUnmount}
              onClick={onClick}
            >
              { /* Child components, such as markers, info windows, etc. */}

              <Marker title='======================' ref={markerRef} position={center} icon={Icon} />

              {directionsResponse && (
                <DirectionsRenderer directions={directionsResponse} >
                  <Marker ref={markerRef} position={center} icon={Icon} />
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
