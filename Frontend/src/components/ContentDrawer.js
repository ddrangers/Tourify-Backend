import React, { useEffect, useState, useContext } from 'react';
import { useReward } from 'react-rewards';
import FlipCard from './FlipCard';
import axios from 'axios';
import {
  Flex,
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerContent,
  DrawerCloseButton,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  SimpleGrid,
  Heading,
  Stack,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
} from '@chakra-ui/react';
import { MapContext } from './MapContext';
import Recommender from './Recommender';
import { APIContext } from './APIContext';

export default function ContentDrawer() {
  const { globalUserInfo, setCheckinState, checkinState } =
    useContext(APIContext);

  const {
    activeDrawer,
    isDrawerOpen,
    setIsDrawerOpen,
    hasTouchScreen,
    attractionsWithBusyness,
  } = useContext(MapContext);

  const toastCheckIn = useToast();
  const toastNotCheckIn = useToast();

  const kebabToCamelCase = str => {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  };

  const capitalizeFirstLetter = str => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getAttractionInfo = attractionName => {
    const formattedAttractionName = capitalizeFirstLetter(
      kebabToCamelCase(attractionName)
    );
    const attraction = attractionsWithBusyness.find(
      attraction => attraction.name_alias === formattedAttractionName
    );
    return attraction || {};
  };

  const { reward: confettiReward, isAnimating: isConfettiAnimating } =
    useReward('confettiReward', 'confetti', {
      lifetime: 2400,
      elementSize: 16,
      elementCount: 100,
    });

  const handleCheckIn = async attractionID => {
    const apiEndpoint = 'https://csi6220-2-vm1.ucd.ie/backend/api/user/update';
    const cachedUserCredential = localStorage.getItem('userCredential');

    const idToken = cachedUserCredential; // get this from credential in signupform
    console.log(cachedUserCredential, 'this is the global credential');

    const requestBody = {
      id_token: idToken,
      attraction_id: attractionID,
      lat: '40.7078931', //hardcoded for testing replace with geolocation variable
      lng: '-74.0117901', //hardcoded for testing reaplace with geolocation variable
    };

    axios
      .post(apiEndpoint, requestBody)
      .then(response => {
        console.log('API call successful:', response.data);
        console.log(response, 'this is response data');
        // Handle the response data here
        if (response.data.code === 200) {
          //   // set logic that your market has been ticked off
          setCheckinState(true);
          console.log(checkinState, 'checkinstate - contentdrawer');
          confettiReward();
          toastCheckIn({
            title: 'Check in Successful.',
            description: "You've Checked in Successfully.",
            status: 'success',
            duration: 3000,
            isClosable: true,
          });

          // get the updated user info from the backend
        }
        if (response.data.code === 10050) {
          // distance too long
          setCheckinState(false);
          console.log(response.data.code, 'this is the repsonse code!');
          toastNotCheckIn({
            title: 'Check in Unsuccessful.',
            description: "You're too far away.",
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      })
      .catch(error => {
        console.error('Error in API call:', error);
        // Handle errors here
      });
  };

  const areAllBadgesTrue = () => {
    if (globalUserInfo && globalUserInfo.data && globalUserInfo.data.badgeDO) {
      const badgesStatusArray = Object.values(globalUserInfo.data.badgeDO);
      return badgesStatusArray.every(status => status === true);
    }
    return false;
  };

  const areAllBadgesFalse = () => {
    if (globalUserInfo && globalUserInfo.data && globalUserInfo.data.badgeDO) {
      const badgesStatusArray = Object.values(globalUserInfo.data.badgeDO);
      return badgesStatusArray.every(status => status === false);
    }
    return false;
  };

  const areAllAttractionsTrue = () => {
    if (
      globalUserInfo &&
      globalUserInfo.data &&
      globalUserInfo.data.attractionStatusDO
    ) {
      const attractionStatusArray = Object.values(
        globalUserInfo.data.attractionStatusDO
      );
      return attractionStatusArray.every(status => status === true);
    }
    return false;
  };

  const areAllAttractionsFalse = () => {
    if (
      globalUserInfo &&
      globalUserInfo.data &&
      globalUserInfo.data.attractionStatusDO
    ) {
      const attractionStatusArray = Object.values(
        globalUserInfo.data.attractionStatusDO
      );
      return attractionStatusArray.every(status => status === false);
    }
    return false;
  };

  return (
    <Drawer
      onClose={() => {
        setIsDrawerOpen(false);
      }}
      isOpen={isDrawerOpen}
      placement="left"
      size={hasTouchScreen ? 'md' : 'md'}
    >
      <DrawerContent
        pointerEvents="all"
        containerProps={{ pointerEvents: 'none', height: '100%' }}
        style={{
          position: 'absolute',
          top: '1',
          height: 'calc(100% - 74px)',
          border: 'solid 1px orangered',
          borderLeft: '0px',
          borderRadius: '20px',
          borderTopLeftRadius: '0px',
          borderBottomLeftRadius: '0px',
          zIndex: '10',
        }}
      >
        <DrawerCloseButton />
        {activeDrawer === 'recommender' && (
          <>
            {' '}
            <DrawerHeader>{`Recommender`}</DrawerHeader>
            <DrawerBody>
              <Recommender />
            </DrawerBody>
          </>
        )}
        {activeDrawer === 'attractions' && (
          <>
            {' '}
            <DrawerHeader>
              {`My Attractions`}
              <span id="confettiReward" />
            </DrawerHeader>
            <DrawerBody>
              <Tabs variant="soft-rounded" colorScheme="orange">
                <TabList>
                  <Tab
                    _selected={{
                      color: 'white',
                      bg: 'orangered',
                      // border: 'solid 1px orangered',
                    }}
                  >
                    Attractions to Visit
                  </Tab>
                  <Tab
                    _selected={{
                      color: 'white',
                      bg: 'orangered',
                      // border: 'solid 1px orangered',
                    }}
                  >
                    Visited Attractions
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* ATTRACTIONS TO VISIT */}
                  <TabPanel>
                    {globalUserInfo &&
                    globalUserInfo.data &&
                    globalUserInfo.data.attractionStatusDO ? (
                      Object.entries(
                        globalUserInfo.data.attractionStatusDO
                      ).map(([attraction, status]) => {
                        if (!status) {
                          const attractionInfo = getAttractionInfo(attraction);
                          if (attractionInfo) {
                            return (
                              <Flex
                                // alignItems="left"
                                // justifyItems="left"
                                border="2px solid orangered"
                                borderRadius="20px"
                                marginTop="5px"
                                marginLeft="10px"
                                overflow="hidden"
                                spacing="20px"
                                p="10px"
                                width="425px"
                                mb="15px"
                              >
                                <Flex
                                  key={attraction}
                                  // mb={4}
                                  width="100%"
                                  flexDirection="column"
                                >
                                  <Flex flexDirection="row">
                                    {' '}
                                    <img
                                      src={`/images/${attractionInfo.name_alias}.jpg`}
                                      alt={attractionInfo.name_alias}
                                      style={{
                                        maxWidth: '100px',
                                        height: '100px',
                                        marginRight: '10px',
                                        // border: '2px solid orangered',
                                        borderRadius: '20px',
                                      }}
                                    />
                                    <div>
                                      <Heading size="md">
                                        {attractionInfo.name}
                                      </Heading>
                                      <p> {attractionInfo.full_address}</p>
                                      <br />
                                    </div>
                                  </Flex>
                                  <Flex mt={4}>
                                    <Alert
                                      status="info"
                                      colorScheme={
                                        attractionInfo.businessRate < 35
                                          ? 'green'
                                          : 35 < attractionInfo.businessRate &&
                                            attractionInfo.businessRate < 70
                                          ? 'yellow'
                                          : 'red'
                                      }
                                      borderRadius={20}
                                      width="60%"
                                      // boxShadow="0 2px 4px rgba(0, 0, 0, 0.2)"
                                    >
                                      <AlertIcon />
                                      <Box>
                                        <AlertTitle>
                                          {attractionInfo.businessRate < 35
                                            ? 'Quiet'
                                            : 35 <
                                                attractionInfo.businessRate &&
                                              attractionInfo.businessRate < 70
                                            ? 'Not Too Busy'
                                            : 'Busy'}
                                        </AlertTitle>
                                        <AlertDescription>
                                          <p>
                                            Busyness Index:{' '}
                                            {attractionInfo.businessRate}
                                          </p>
                                        </AlertDescription>
                                      </Box>
                                    </Alert>
                                    <Stack
                                      spacing={10}
                                      justifyContent="center"
                                      alignItems="center"
                                      width="40%"
                                    >
                                      <Button
                                        style={{
                                          backgroundColor: 'white',
                                          color: 'black',
                                          border: 'solid 2px gold',
                                          borderRadius: '20px',
                                          marginTop: '5px',
                                          padding: '10px 20px',
                                          boxShadow:
                                            '0 2px 4px rgba(0, 0, 0, 0.2)',
                                        }}
                                        onClick={() =>
                                          handleCheckIn(attractionInfo.id)
                                        }
                                      >
                                        Check In!
                                      </Button>
                                    </Stack>
                                  </Flex>
                                </Flex>
                              </Flex>
                            );
                          }
                        }
                        return null;
                      })
                    ) : (
                      <p>Loading attractions to visit...</p>
                    )}

                    {/* Conditional rendering for the image when all attractions are false */}
                    {areAllAttractionsFalse() && (
                      <p>
                        <img
                          src={'/images/no_Attractions_Visited.jpg'}
                          alt="All Attractions are False"
                          style={{ maxWidth: '500px', height: '500px' }}
                        />
                      </p>
                    )}
                  </TabPanel>

                  {/* VISITED ATTRACTIONS */}
                  <TabPanel>
                    {globalUserInfo &&
                    globalUserInfo.data &&
                    globalUserInfo.data.attractionStatusDO ? (
                      Object.entries(
                        globalUserInfo.data.attractionStatusDO
                      ).map(([attraction, status]) => {
                        if (status) {
                          const attractionInfo = getAttractionInfo(attraction);
                          if (attractionInfo) {
                            return (
                              <Flex
                                // alignItems="left"
                                // justifyItems="left"
                                border="2px solid green"
                                borderRadius="20px"
                                marginTop="5px"
                                marginLeft="10px"
                                overflow="hidden"
                                spacing="20px"
                                p="10px"
                                width="425px"
                                mb="15px"
                              >
                                <Flex
                                  key={attraction}
                                  // mb={4}
                                  width="100%"
                                  flexDirection="column"
                                >
                                  <Flex flexDirection="row">
                                    {' '}
                                    <img
                                      src={`/images/${attractionInfo.name_alias}.jpg`}
                                      alt={attractionInfo.name_alias}
                                      style={{
                                        maxWidth: '100px',
                                        height: '100px',
                                        marginRight: '10px',
                                        // border: '2px solid orangered',
                                        borderRadius: '20px',
                                      }}
                                    />
                                    <div>
                                      <Heading size="md">
                                        {attractionInfo.name}
                                      </Heading>
                                      <p> {attractionInfo.full_address}</p>
                                      <br />
                                    </div>
                                  </Flex>
                                  <Flex mt={4}>
                                    <Alert
                                      status="info"
                                      colorScheme={
                                        attractionInfo.businessRate < 35
                                          ? 'green'
                                          : 35 < attractionInfo.businessRate &&
                                            attractionInfo.businessRate < 70
                                          ? 'yellow'
                                          : 'red'
                                      }
                                      borderRadius={20}
                                      width="60%"
                                      // boxShadow="0 2px 4px rgba(0, 0, 0, 0.2)"
                                    >
                                      <AlertIcon />
                                      <Box>
                                        <AlertTitle>
                                          {attractionInfo.businessRate < 35
                                            ? 'Quiet'
                                            : 35 <
                                                attractionInfo.businessRate &&
                                              attractionInfo.businessRate < 70
                                            ? 'Not Too Busy'
                                            : 'Busy'}
                                        </AlertTitle>
                                        <AlertDescription>
                                          <p>
                                            Busyness Index:{' '}
                                            {attractionInfo.businessRate}
                                          </p>
                                        </AlertDescription>
                                      </Box>
                                    </Alert>
                                    <Stack
                                      spacing={10}
                                      justifyContent="center"
                                      alignItems="center"
                                      width="40%"
                                    >
                                      <Button
                                        style={{
                                          backgroundColor: '#17B169',
                                          color: 'white',
                                          border: 'solid 1px green',
                                          borderRadius: '20px',
                                          marginTop: '5px',
                                          padding: '10px 20px',
                                          // boxShadow:
                                          //   '0 2px 4px rgba(0, 0, 0, 0.2)',
                                        }}
                                      >
                                        Visited!
                                      </Button>
                                    </Stack>
                                  </Flex>
                                </Flex>
                              </Flex>
                            );
                          }
                        }
                        return null;
                      })
                    ) : (
                      <p>Loading attractions to visit...</p>
                    )}

                    {areAllAttractionsTrue() && (
                      <FlipCard
                        frontContent={
                          <p>
                            <img
                              src={'/images/all_Attractions_Visited.jpg'}
                              alt="All Attractions are True"
                              style={{
                                maxWidth: '500px',
                                height: '500px',
                                marginRight: '10px',
                                border: '2px solid orangered',
                                borderRadius: '5px',
                              }}
                            />
                          </p>
                        }
                        backContent={
                          <div>
                            <Heading>
                              You've Visited All the Attractions!
                            </Heading>
                          </div>
                        }
                      />
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </DrawerBody>
          </>
        )}
        {activeDrawer === 'badges' && (
          <>
            {' '}
            <DrawerHeader>{`My Badges`}</DrawerHeader>
            <DrawerBody>
              <Tabs>
                <TabList>
                  <Tab>My Badges</Tab>
                  <Tab>Badges to Collect</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <Flex>
                      <div>
                        {Object.entries(globalUserInfo.data.badgeDO).map(
                          ([badge, status]) => {
                            if (status) {
                              return (
                                <SimpleGrid
                                  alignItems="left"
                                  justifyItems="left"
                                  border="3px solid orangered"
                                  borderRadius="20px"
                                  marginTop="5px"
                                  marginLeft="10px"
                                  overflow="hidden"
                                  spacing={8}
                                  p="10px"
                                  width="425px"
                                >
                                  <Flex key={badge} width="100%">
                                    {' '}
                                    <img
                                      src={`/images/badgeimages/${badge}.jpg`}
                                      alt={badge}
                                      style={{
                                        maxWidth: '100px',
                                        height: '100px',
                                        marginRight: '10px',
                                        border: '2px solid orangered',
                                        borderRadius: '5px',
                                      }}
                                    />
                                    <div>
                                      <Heading size="md">{badge}</Heading>
                                      <p> Badge info: Some badge info</p>
                                    </div>
                                  </Flex>
                                </SimpleGrid>
                              );
                            }
                            return null;
                          }
                        )}
                        {areAllBadgesFalse() && (
                          <p>
                            {''}
                            <br />
                            <Heading>You Dont Have Any Badges Yet!</Heading>
                            <br />
                            <img
                              src={'/images/badgeimages/no_badges.jpg'}
                              alt="All Badges are True"
                              style={{
                                maxWidth: '500px',
                                height: '500px',
                                marginRight: '10px',
                                border: '2px solid orangered',
                                borderRadius: '5px',
                              }}
                            />
                          </p>
                        )}
                      </div>
                    </Flex>
                  </TabPanel>
                  <TabPanel>
                    <Flex>
                      <div>
                        {Object.entries(globalUserInfo.data.badgeDO).map(
                          ([badge, status]) => {
                            if (!status) {
                              return (
                                <SimpleGrid
                                  alignItems="left"
                                  justifyItems="left"
                                  border="3px solid orangered"
                                  borderRadius="20px"
                                  marginTop="5px"
                                  marginLeft="10px"
                                  overflow="hidden"
                                  spacing={8}
                                  p="10px"
                                  width="425px"
                                >
                                  <Flex key={badge} width="100%">
                                    {' '}
                                    <img
                                      src={`/images/badgeimages/${badge}.jpg`}
                                      alt={badge}
                                      style={{
                                        maxWidth: '100px',
                                        height: '100px',
                                        marginRight: '10px',
                                        border: '2px solid orangered',
                                        borderRadius: '5px',
                                      }}
                                    />
                                    <div>
                                      <Heading size="md">{badge}</Heading>
                                      <p> Badge info: Some badge info</p>
                                    </div>
                                  </Flex>
                                </SimpleGrid>
                              );
                            }
                            return null;
                          }
                        )}
                        {areAllBadgesTrue() && (
                          <FlipCard
                            frontContent={
                              <p>
                                <img
                                  src={'/images/badgeimages/all_Badges.jpg'}
                                  alt="All Attractions are True"
                                  style={{
                                    maxWidth: '500px',
                                    height: '500px',
                                    marginRight: '10px',
                                    border: '2px solid orangered',
                                    borderRadius: '5px',
                                  }}
                                />
                              </p>
                            }
                            backContent={
                              <div>
                                <Heading>You've Got All The Badges!</Heading>
                              </div>
                            }
                          />
                        )}
                      </div>
                    </Flex>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
