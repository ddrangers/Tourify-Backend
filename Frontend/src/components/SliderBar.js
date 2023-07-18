import React, { useState, useEffect, useContext } from 'react';
import {
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderMark,
  Box,
} from '@chakra-ui/react';
import { Flex } from '@chakra-ui/react';
import { MdGraphicEq } from 'react-icons/md';
//import attractions from '../static/attractions.json';
import { APIContext } from './APIContext';

export default function SliderBar({ setSliderListFunc }) {
  const { apiAttractions, apiLoaded } = useContext(APIContext);

  const [sliderValue, setSliderValue] = useState([0, 100]);
  const [filteredAttractions, setFilteredAttractions] =
    useState(apiAttractions);

  const handleSliderChange = value => {
    setSliderValue(value);
  };

  useEffect(() => {
    if (apiLoaded) {
      const filtered = apiAttractions.filter(
        attraction =>
          attraction.busyness_score >= sliderValue[0] &&
          attraction.busyness_score <= sliderValue[1]
      );
      setFilteredAttractions(filtered);
    }
  }, [sliderValue]);

  useEffect(() => {
    setSliderListFunc(filteredAttractions);
  }, [filteredAttractions, setSliderListFunc]);

  return (
    <Flex
      style={{
        // border: 'solid 10px orangered',
        // borderRadius: '25px',
        alignItems: 'center',
        // justifyContent: 'center',
        width: '100px',
        height: '100%',
        zIndex: 1,
        position: 'absolute',
        // marginTop: '5em',
        // marginLeft: '77em',
        top: 14,
        right: 3,
        flexDirection: 'column',
      }}
    >
      <Flex
        style={{
          border: 'solid 2px white',
          borderRadius: '25px',
          boxShadow: '1px 1px 5px 1px rgba(0, 0, 0, 0.6)',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'white',
        }}
      >
        <img
          src="/images/busyness-slider/busy.svg"
          alt="Busyness Slider"
          style={{ height: '40px', width: '40px' }}
        />
        <RangeSlider
          aria-label={['min', 'max']}
          defaultValue={[0, 100]}
          orientation="vertical"
          minH="505"
          maxW="20"
          position={'right'}
          border={'solid 20px white'}
          borderRadius={'20px'}
          backgroundColor={'white'}
          step={1}
          // call function as slider moves
          onChangeEnd={handleSliderChange}
        >
          <RangeSliderTrack>
            <RangeSliderFilledTrack backgroundColor="orange" />
          </RangeSliderTrack>
          <RangeSliderThumb
            index={0}
            backgroundColor={'orange'}
            border="solid 1px white"
          />
          <RangeSliderThumb
            index={1}
            backgroundColor={'orange'}
            border="solid 1px white"
          />
        </RangeSlider>
        <img
          src="/images/busyness-slider/not-busy.svg"
          alt="Busyness Slider"
          style={{ height: '45px', width: '45px' }}
        />
      </Flex>
    </Flex>
  );
}