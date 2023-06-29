import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';
import attractions from '../static/attractions.json';
import { libraries, mapOptions } from '../static/mapConfig.js';
import { Flex, Divider } from '@chakra-ui/react';
import '../App.css';
import LocationButton from './LocationButton';
import SliderBar from './SliderBar';

export default function Map() {

  
  //receiving filtered attractions from slider
  //pass setSliderList method into slider to receive sliders filtered
  //attractions list, update sliderList state with that list we receive
  const [sliderList,setSliderList]=useState([]);
  //console.log(sliderList, 'this came from the slider component to the map!!!!')
  const [map, setMap] = useState(null);


  const [address, setAddress] = useState('');
  const [markers, setMarkers] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState(['all']);
  const currentLocationInputRef = useRef(null);





  const google = window.google;
  const mapCenter = { lat: 40.755091, lng: -73.978285 };
  const mapZoom = 13;
  let currentLocation;

  const attractionTypes = [
    { label: 'All', value: 'all' },
    { label: 'Landmark', value: 'landmark' },
    { label: 'Museum', value: 'museum' },
    { label: 'Park', value: 'park' },
    { label: 'Theatre', value: 'theater' },
    { label: 'Neighborhood', value: 'neighborhood' },
    { label: 'Dining', value: 'dining' },
    { label: 'Gallery', value: 'gallery' },
    { label: 'Library', value: 'library' },
    { label: 'Historic Site', value: 'historic_site' },
    { label: 'Observatory', value: 'observatory' },
  ];

  const getPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, posError);
    } else {
      alert('Sorry, Geolocation is not supported by this browser.');
    }
  };

  const posError = () => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(res => {
        if (res.state === 'denied') {
          alert(
            'Enable location permissions for this website in your browser settings.'
          );
        }
      });
    } else {
      alert(
        'Unable to access your location. You can continue by submitting location manually.'
      );
    }
  };

  const showPosition = position => {
    const latlng = {
      lat: parseFloat(position.coords.latitude),
      lng: parseFloat(position.coords.longitude),
    };

    const geocoder = new google.maps.Geocoder();
    // const infowindow = new google.maps.InfoWindow();

    geocoder
      .geocode({ location: latlng })
      .then(response => {
        if (response.results[0]) {
          currentLocation = response.results[0].formatted_address;
          console.log(latlng);
          map.setCenter(latlng);
          map.setZoom(15);

          if (currentLocationInputRef.current) {
            currentLocationInputRef.current.value = currentLocation;
          }

          // eslint-disable-next-line
          const marker = new google.maps.Marker({
            position: latlng,
            map: map,
            icon: '/images/you-are-here.png',
          });

          // infowindow.setContent('You are here!');
          // infowindow.open(map, marker);
        } else {
          window.alert('No results found');
        }
      })
      .catch(e => window.alert('Geocoder failed due to: ' + e));
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    libraries: libraries,
  });

  useEffect(() => {
    if (map) {
      // // clear existing markers from the map for filter
      markers.forEach(marker => {
        marker.setMap(null);
      });

      // filter attractions based on the selected filter value
      const filteredMarkers = selectedFilters.includes('all')
        ? sliderList
        : sliderList.filter(attraction =>
            selectedFilters.includes(attraction.type)
          );

      // add filtered markers
      const newMarkers = filteredMarkers.map(attraction => {
        const marker = new google.maps.Marker({
          position: {
            lat: attraction.coordinates_lat,
            lng: attraction.coordinates_lng,
          },
          map: map,
          title: attraction.name,
        });
        return marker;
      });

      // set the markers state
      setMarkers(newMarkers);
    }
  }, [map, sliderList, selectedFilters]);

  const handleChange = newAddress => {
    setAddress(newAddress);
  };

  const handleSelect = async newAddress => {
    try {
      const results = await geocodeByAddress(newAddress);
      const latLng = await getLatLng(results[0]);

      map.panTo(latLng);
      map.setZoom(15);
    } catch (error) {
      console.log('Error:', error);
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      zoom={mapZoom}
      center={mapCenter}
      options={mapOptions}
      mapContainerClassName="map"
      onLoad={map => {
        setMap(map);
      }}
    >
      <Flex
        flexDirection="column"
        style={{ position: 'absolute', top: 10, left: 10 }}
      >
        <Flex
          style={{
            width: 'fit-content',
            border: 'solid 2px orangered',
            borderRadius: '20px',
            backgroundColor: 'white',
            zIndex: 1,
            height: '38px',
          }}
        >
          <PlacesAutocomplete
            value={address}
            onChange={handleChange}
            onSelect={handleSelect}
          >
            {({
              getInputProps,
              suggestions,
              getSuggestionItemProps,
              loading,
            }) => (
              <div
                style={{
                  borderRadius: '20px',
                  padding: '5px',
                  paddingLeft: '10px',
                  flex: 1,
                }}
              >
                <input
                  {...getInputProps({ placeholder: 'Explore Manhattan' })}
                />
                <div>
                  {loading ? <div>Loading...</div> : null}
                  {suggestions.map(suggestion => {
                    const style = {
                      backgroundColor: suggestion.active ? '#eaeaea' : '#fff',
                      cursor: 'pointer',
                      padding: '5px 10px',
                    };
                    return (
                      <div {...getSuggestionItemProps(suggestion, { style })}>
                        {suggestion.description}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </PlacesAutocomplete>
          <Divider orientation="vertical" />
          <input
            ref={currentLocationInputRef}
            style={{
              paddingLeft: '10px',
            }}
            placeholder={'Current Map View'}
            value={currentLocation}
          />
          <LocationButton getPosition={getPosition} />
        </Flex>
        <Flex
          flexDirection="column"
          style={{
            // position: 'absolute',
            // top: 10,
            // right: 10,
            zIndex: 1,
            height: '38px',
          }}
        >
          {attractionTypes.map(attractionType => (
            <button
              key={attractionType.value}
              onClick={() => {
                if (selectedFilters.includes(attractionType.value)) {
                  // Remove the attractionType.value from selectedFilters array
                  setSelectedFilters(
                    selectedFilters.filter(
                      filter => filter !== attractionType.value
                    )
                  );
                } else {
                  // Add the attractionType.value to selectedFilters array
                  setSelectedFilters([
                    ...selectedFilters,
                    attractionType.value,
                  ]);
                }
              }}
              style={{
                // width: 'fit-content',
                width: '140px',
                marginTop: '10px',
                padding: '5px',
                paddingRight: '10px',
                paddingLeft: '10px',
                border: 'solid 2px orangered',
                borderRadius: '20px',
                background: selectedFilters.includes(attractionType.value)
                  ? 'orangered'
                  : 'white',
                color: selectedFilters.includes(attractionType.value)
                  ? 'white'
                  : 'black',
              }}
            >
              {attractionType.label}
            </button>
          ))}
        </Flex>

        {/* passing the setSliderListFunc to the slider from map 
         data it receives will be used by setSliderList method to update
        the sliderList state */}
        <SliderBar setSliderListFunc={setSliderList}/>
      </Flex>
      
    </GoogleMap>
  );
}
