import React, { useState, useEffect, useContext } from 'react';
import { NFTStorage } from 'nft.storage';
import {
  Button,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box
} from '@chakra-ui/react';
import { useReward } from 'react-rewards';

import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import {
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Input,
} from '@chakra-ui/react';
import { APIContext } from './APIContext';
import { MapContext } from './MapContext';

export default function SignUpForm({ setIsLoggedIn }) {
  const [loading, setLoading] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [buttonsDirection, setButtonsDirection] = useState('row');
  const { isMobile, hasTouchScreen } = useContext(MapContext);
  const {
    globalUserInfo,
    setGlobalUserInfo,
    setGlobalCredential,
    checkinState,
    setCheckinState,
    globalCredential,
    badgeState,
    setBadgeState,
    newBadgeState,
    setNewBadgeState,
  } = useContext(APIContext);
  const [userInfoFetched, setUserInfoFetched] = useState(false);
  const { setIsDrawerOpen } = useContext(MapContext);
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
  const [modalContent, setModalContent] = useState('');
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);

  const handleButtonClick = content => {
    setModalContent(content);
    onOpen();
  };
  const toastLogin = useToast();
  const toastSignup = useToast();
  const toastLogout = useToast();
  const toastSignupError = useToast();
  const toastLoginError = useToast();
  const toastBadge = useToast();
  const toastNFT = useToast();
  const toastUpdate = useToast();
  const toastUpdateError = useToast();
  const toastWallet = useToast();
  const toastFeedback = useToast();

  const [timerId, setTimerId] = useState(null);

  // Function to reset the timer
  const resetLogoutTimer = () => {
    if (timerId) {
      clearTimeout(timerId);
    }
    setTimerId(
      setTimeout(() => {
        handleLogout(); // Call  logout function here
      }, 45 * 60 * 1000) // 45 minutes in milliseconds
    );
  };

  useEffect(() => {
    // When the user is logged in, start the timer
    if (userLoggedIn) {
      resetLogoutTimer();
    } else {
      // Clear the timer when the user logs out
      clearTimeout(timerId);
    }
  }, [userLoggedIn]);

  useEffect(() => {
    const loggedInfo = localStorage.getItem('loggedInfo');
    setUserLoggedIn(loggedInfo === 'true');
    setLoading(false);

    // Check if user info is cached
    const cachedUserInfo = localStorage.getItem('userInfo');
    if (loggedInfo === 'true' && cachedUserInfo) {
      setGlobalUserInfo(JSON.parse(cachedUserInfo));
      setUserInfoFetched(true);
    }
  }, []);

  useEffect(() => {
    console.log(hasTouchScreen);
    if (hasTouchScreen) {
      setButtonsDirection('column');
      console.log('buttonssssss', buttonsDirection);
    } else {
      setButtonsDirection('row');
    }
  }, [hasTouchScreen]);

  useEffect(() => {
    if (checkinState) {
      // Call the userInfoUpdate function to trigger the API call
      userInfoUpdate();
    }
  }, [checkinState]);

  useEffect(() => {
    if (newBadgeState) {
      badgeChecker(badgeState, newBadgeState);
    }
  }, [checkinState, badgeState, newBadgeState]);

  const badgeChecker = (badgeState, newBadgeState) => {
    // Compare each badge property in the objects
    for (const badge in newBadgeState.badgeDO) {
      const oldBadgeValue = badgeState.badgeDO[badge];
      const newBadgeValue = newBadgeState.badgeDO[badge];

      // Check if the badge value has changed from false to true
      if (oldBadgeValue === false && newBadgeValue === true) {
        // Show a toast with the badge name
        const badgeName = badge.replace(/_/g, ' '); // Replace underscores with spaces
        toastBadge({
          title: 'Congratulations!',
          description: `You've acquired the badge "${badgeName}".`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const userInfoUpdate = async credentialResponse => {
    //console.log(credentialResponse, 'THIS IS THE CRED for checkin');
    // const { checkinCredential } = credentialResponse;

    //setGlobalCredential(credentialResponse.credential); // Set the credential as a global variable
    const cachedUserCredential = localStorage.getItem('userCredential');
    if (cachedUserCredential) {
      axios
        .post(
          // `https://csi6220-2-vm1.ucd.ie/backend/api/user/info?idTokenString=${cachedUserCredential}`
          `http://localhost:8001/api/user/info?idTokenString=${cachedUserCredential}`
        ) //user info, json w/ true false
        .then(response => {
          console.log(response.data, 'updated user info');
          setGlobalUserInfo(response.data);

          if (response.status === 200) {
            setGlobalUserInfo(response.data);
            setNewBadgeState(response.data);
            setUserLoggedIn(true);
            setIsLoggedIn(true);

            // Cache the user info
            localStorage.setItem('userInfo', JSON.stringify(response.data));

            // Cache the user credential
            //localStorage.setItem('userCredential', globalCredential);
            //reset checkinstate to false
            setCheckinState(false);

            toastUpdate({
              title: 'Attractions Updated.',
              description: 'Your Attractions Have Been Updated.',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });

            setUserInfoFetched(true);
          } else {
            //setUserLoggedIn(false);
            //setIsLoggedIn(false);
            toastUpdateError({
              title: 'Update Error.',
              description: 'Error with update, please please refresh page.',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
          }
        })
        .catch(error => console.log(error));
    }
  };

  const backendLogin = async credentialResponse => {
    console.log(credentialResponse, 'THIS IS THE CRED');
    const { credential } = credentialResponse;

    setGlobalCredential(credential); // Set the credential as a global variable

    if (credential) {
      axios
        .post(
          // `https://csi6220-2-vm1.ucd.ie/backend/api/user/info?idTokenString=${credential}`
          `http://localhost:8001/api/user/info?idTokenString=${credential}`
        ) //user info, json w/ true false
        .then(response => {
          console.log(response.data, 'user info');
          setGlobalUserInfo(response.data);
          setGlobalCredential(credential);
          console.log(globalUserInfo, 'retrieving the cached info');
          setGlobalCredential(credential);
          setBadgeState(response.data);

          if (response.status === 200 && response.data.code !== 10004) {
            setGlobalUserInfo(response.data);
            setGlobalCredential(credential);


            setUserLoggedIn(true);
            setIsLoggedIn(true);
            localStorage.setItem('loggedInfo', 'true'); // Store logged-in state in localStorage

            // Cache the user info
            localStorage.setItem('userInfo', JSON.stringify(response.data));

            // Cache the user credential
            localStorage.setItem('userCredential', credential);

            toastLogin({
              title: 'Login Successful.',
              description: "You've Logged in Successfully.",
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
            onClose();

            setUserInfoFetched(true);
          }
          if (response.data.code === 10004) {
            setUserLoggedIn(false);
            setIsLoggedIn(false);
            localStorage.setItem('loggedInfo', 'false'); // Store logged-in state in localStorage
            toastLoginError({
              title: 'Login Error.',
              description:
                'You need to create and account before you can login.',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
            onClose();
          }
        })
        .catch(error => console.log(error));
    }
  };

  const backendSignUp = credentialResponse => {
    console.log(credentialResponse, 'THIS IS THE CRED');
    const { credential } = credentialResponse;
    setGlobalCredential(credentialResponse.credential);

    if (credential) {
      console.log(credential);
      axios
        .post(
          // `https://csi6220-2-vm1.ucd.ie/backend/api/user/register?idTokenString=${credential}`
          `http://localhost:8001/api/user/register?idTokenString=${credential}`
        )
        .then(response => {
          // setGlobalUserInfo(response.data);
          console.log(
            response.data,
            'this is from the backend login for sign up'
          );

          if (response.data.code !== 10006) {
            backendLogin(credentialResponse);

            toastSignup({
              title: 'Account created.',
              description: "We've created your account for you.",
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
            onClose();
          }
          if (response.data.code === 10006) {
            setUserLoggedIn(false);
            setIsLoggedIn(false);
            onToggle(false);
            localStorage.setItem('loggedInfo', 'false'); // Store logged-in state in localStorage
            toastSignupError({
              title: 'Account Present.',
              description: 'You already have an account.',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
            onClose();
          }
        })
        .catch(error => console.log(error));
    }
  };

  const deleteAccount = async () => {
    console.log(globalCredential, 'THIS IS THE CRED!!!ASDJASJDL!!');

    if (globalCredential) {
      axios
        .post(
          // `https://csi6220-2-vm1.ucd.ie/backend/api/user/delete?idTokenString=${globalCredential}`
          `http://localhost:8001/api/user/delete?idTokenString=${globalCredential}`
        ) //user info, json w/ true false
        .then(response => {
          // if (response.data.code === 10004) {
          setUserLoggedIn(false);
          setIsLoggedIn(false);
          localStorage.clear(); // Clear the cache

          handleLogout();

          toastLogin({
            title: 'Account successfully deleted.',
            description: 'We hope to see you again.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          onClose();
        })
        .catch(error => console.log(error));
    }
  };

  const handleDeleteConfirmation = () => {
    setDeleteAlertOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteAlertOpen(false);
  };

  const handleDeleteAccount = () => {
    handleDeleteCancel();
    deleteAccount();
  };

  const handleLogout = () => {
    setUserLoggedIn(false);
    setIsLoggedIn(false);
    localStorage.setItem('loggedInfo', 'false'); // Store logged-in state in localStorage
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userCredential');
    setIsDrawerOpen(false);
    setGlobalCredential(null);
    onToggle(false);
    toastLogout({
      title: 'Logout.',
      description: "You've logged out successfully.",
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onClose();
  };

  const [walletInput, setWalletInput] = useState('');
  const {
    isOpen: isNFTModalOpen,
    onOpen: onNFTModalOpen,
    onClose: onNFTModalClose,
  } = useDisclosure();

  // Function to handle changes in the wallet input field
  const handleWalletInputChange = event => {
    setWalletInput(event.target.value);
  };

  const handleAddWalletClick = () => {
    onNFTModalOpen();
  };

const handleWalletEntry = walletInput => {
    console.log(globalCredential, 'THIS IS THE CRED!!!ASDJASJDL!!');

    if (
      globalCredential &&
      walletInput.startsWith('0x') &&
      walletInput.length === 42
    ) {
      axios
        .post(
          `http://localhost:8001/api/user/updateNft?nftLink=${walletInput}&idTokenString=${globalCredential}`
        ) //Add Wallet address
        .then(response => {
          console.log(response.data, 'user info1');

          if (response.data.code === 200) {
            console.log(response.data, 'user info');
            setGlobalUserInfo(response.data);
            console.log(globalUserInfo, 'retrieving the cached info');

            toastWallet({
              title: 'NFT Wallet Added!.',
              description:
                'You can now mint NFTs when you get a badge!. Be sure to connect your wallet with OpenSea to see your NFTs!',
              status: 'success',
              duration: 6000,
              isClosable: true,
            });

            // Close the modal after successful entry
            onNFTModalClose();
          }
        })
        .catch(error => console.log(error));
    } else {
      toastWallet({
        title: 'Please enter a valid NFT Wallet Address.',
        description:
          'Your Address must be 42 characters long and begin with 0x',
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    setWalletInput(''); // Clear the input field when "Cancel" is clicked
    onNFTModalClose();
  };



////////////////////////////////
///                      ///////
///  FEEDBACK FORM CODE ////////
///                     ////////
////////////////////////////////

const { reward: confettiReward, isAnimating: isConfettiAnimating } =
useReward('confettiReward', 'confetti', {
  lifetime: 2400,
  elementSize: 16,
  elementCount: 100,
});
  const [feedbackInput, setFeedbackInput] = useState('');

  // Function to handle changes in the user feedback input field
  const handleFeedbackInputChange = event => {
    setFeedbackInput(event.target.value);
  };
  const {
    isOpen: isFeedbackModalOpen,
    onOpen: onFeedbackModalOpen,
    onClose: onFeedbackModalClose,
  } = useDisclosure();

const handleFeedbackClick = () => {
  setFeedbackInput('');
onFeedbackModalOpen();
};
const handleFeedbackEntry = feedbackInput => {
  setFeedbackInput('');
  confettiReward();
  toastFeedback({
    title: 'Feedback Submitted.',
    description: "Thankyou for the input to help us improve the site.",
    status: 'success',
    duration: 3000,
    isClosable: true,
  });

  onFeedbackModalClose();
};

const handleFeedbackCancel = () => {
  setFeedbackInput(''); // Clear the input field when "Cancel" is clicked
  onFeedbackModalClose();
};









  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <Flex
      flexDirection={buttonsDirection}
      minWidth="190px"
      justifyContent="flex-end"
    >  <Box position="absolute"
    top="50%"
    left="50%"
    transform="translate(-50%, -50%)" zIndex={9999999} id="confettiReward" />

      {userLoggedIn ? (
        <Menu>
          <MenuButton
            bg="orange"
            as={Button}
            color="white"
            border="solid 1px orangered"
            borderRadius="25px"
            _hover={{ bg: 'orangered', color: 'white' }}
          >
            User Options
          </MenuButton>
          <MenuList zIndex={5}>
            <MenuItem onClick={handleLogout}>Log Out</MenuItem>
            <MenuItem onClick={handleDeleteConfirmation}>
              Delete Account
            </MenuItem>
            <MenuItem onClick={handleAddWalletClick}>Add NFT Wallet</MenuItem>
            <MenuItem onClick={handleFeedbackClick}>User Feedback</MenuItem>{' '}

          </MenuList>
        </Menu>
      ) : (
        <>
          <Flex mr={2}>
            <Button
              bg="white"
              border="solid 1px orangered"
              borderRadius="25px"
              onClick={() => {
                handleButtonClick('logIn');
              }}
            >
              Log In
            </Button>
          </Flex>
          <Flex>
            <Button
              bg="orange"
              color="white"
              border="solid 1px orangered"
              borderRadius="25px"
              _hover={{ bg: 'orangered', color: 'white' }}
              onClick={() => handleButtonClick('signUp')}
            >
              Sign Up
            </Button>
          </Flex>

          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                {modalContent === 'logIn' ? 'Welcome back!' : 'Welcome!'}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {modalContent === 'logIn' ? (
                  <GoogleLogin
                    clientId="568208948795-5dv85a002gctb076vpor6905ur987is0.apps.googleusercontent.com"
                    onSuccess={backendLogin}
                    onFailure={error =>
                      console.log('Google login failed:', error)
                    }
                    cookiePolicy="single_host_origin"
                    icon="false"
                    style={{
                      marginLeft: '1.5em',
                      marginTop: '1em',
                    }}
                    color="black"
                    bg="white"
                    border="1px"
                    borderRadius="0px"
                    borderColor="orangered"
                    shape="pill"
                    buttonText="Login"
                  />
                ) : (
                  <GoogleLogin
                    clientId="568208948795-5dv85a002gctb076vpor6905ur987is0.apps.googleusercontent.com"
                    onSuccess={backendSignUp}
                    onFailure={error =>
                      console.log('Google login failed:', error)
                    }
                    style={{
                      marginLeft: '1.5em',
                      marginTop: '1em',
                    }}
                    color="black"
                    bg="white"
                    border="1px"
                    borderRadius="10px"
                    borderColor="orangered"
                    buttonText="Sign Up"
                    shape="pill"
                    text="Sign Up"
                  />
                )}
              </ModalBody>
              <ModalFooter />
            </ModalContent>
          </Modal>
        </>
      )}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={undefined}
        onClose={handleDeleteCancel}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Account
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete your account?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={undefined} onClick={handleDeleteCancel}>
                No
              </Button>
              <Button colorScheme="red" ml={3} onClick={handleDeleteAccount}>
                Yes
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Modal zIndex={9999} isOpen={isNFTModalOpen} onClose={onNFTModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add NFT Wallet Address</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Enter your wallet address"
              value={walletInput}
              onChange={handleWalletInputChange}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => handleWalletEntry(walletInput)}
            >
              Submit
            </Button>
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal zIndex={9999} isOpen={isFeedbackModalOpen} onClose={onFeedbackModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Submit User Feedback</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Any ways you think we could improve the website?"
              value={feedbackInput}
              onChange={handleFeedbackInputChange}
            />
          </ModalBody>
          <ModalFooter>

            <Button
            
              colorScheme="blue"
              mr={3}
              onClick={() => handleFeedbackEntry(feedbackInput)}
            >
              Submit
            </Button>
            <Button variant="ghost" onClick={handleFeedbackCancel}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
