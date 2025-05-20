/// <reference types="vite/client" />

interface Window {
  RTCPeerConnection: {
    new(configuration?: RTCConfiguration): RTCPeerConnection;
  };
  webkitRTCPeerConnection?: {
    new(configuration?: RTCConfiguration): RTCPeerConnection;
  };
  mozRTCPeerConnection?: {
    new(configuration?: RTCConfiguration): RTCPeerConnection;
  };
}
