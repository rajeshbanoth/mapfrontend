import React, { useEffect, useRef, useState } from 'react'
import { Autocomplete, DirectionsRenderer, GoogleMap, Marker, MarkerClusterer, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { Button, Input, TextField, Typography } from '@mui/material';
import Icon from './icon.png'
import Geocode from "react-geocode";
import io from 'socket.io-client'

Geocode.setApiKey("AIzaSyAc3i0GAN-Vzw7ZPK4FMR4RBXyKs7KTWow");
const socket = io.connect("https://livetrackingapp.herokuapp.com/")

const libraries = ['places']
export default function  User(props) {


  let libRef = React.useRef(libraries)


  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
 const [driverRoute,setDriverRoute]=useState(null)
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


  const DrawDriverRoute = async(route)=>{
     // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService()
    const results = await directionsService.route({
      origin:route.origin,
      destination:route.destination,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    })

    setDirectionsResponse(results)
    setDistance(results.routes[0].legs[0].distance.text)
    setDuration(results.routes[0].legs[0].duration.text)


  }

  useEffect(()=>{
    socket.on("recieve_driver_location", (location) => { 
      console.log(location,"d lo")
      setcenter({
        lat: location.driver_position.lat,
        lng: location.driver_position.lng
      })
    })

    socket.on("recieve_driver_route",(route)=>{
      console.log(route,"a")
      setDirectionsResponse(route.results)
      setDistance(route.distance)
      setDuration(route.time)

    })

  },[socket])











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
       
        {isLoaded ? (
          <>
         
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
