import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import "./Room.css";
const RoomPage = () => {
  const [peerId, setPeerId] = useState('');
  const [peers, setPeers] = useState([]); // Array of remote peers
  const peerInstance = useRef(null);
  const socket = useRef(null);
  const email=useParams();
  const videoRefs = useRef({}); // Object to store video elements for each peer

  useEffect(() => {
    const peer = new Peer();
    peer.on('open', (id) => {
      setPeerId(id);
      socket.current = io("https://11be2e6a-dc4e-4110-8aae-b42937a819b6-00-2hxm20xbb07m2.sisko.replit.dev");

      socket.current.emit("userConnect", { roomId: 1, email, peerId: id });

      // Handle new peers in the room
      socket.current.on("roomPeers", ({ peers }) => {
        setPeers(peers); // Update list of remote peers
        peers.forEach(({ peerId }) => initiateCall(peerId)); // Call each existing peer
      });

      socket.current.on("addPeer", ({ peerId }) => {
        if (!peers.find((p) => p.peerId === peerId)) {
          setPeers((prev) => [...prev, { peerId }]); // Add new peer
          initiateCall(peerId); // Call the new peer
        }
      });

      socket.current.on("removePeer", ({ peerId }) => {
        setPeers((prev) => prev.filter((p) => p.peerId !== peerId));
        delete videoRefs.current[peerId]; // Remove the video reference
      });
    });

    peer.on("call", (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        call.answer(stream); // Answer incoming call
        call.on("stream", (remoteStream) => {
          playStream(call.peer, remoteStream); // Play remote stream
        });
      });
    });

    peerInstance.current = peer;
  }, []);

  const initiateCall = (remotePeerId) => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      const call = peerInstance.current.call(remotePeerId, stream);
      call.on("stream", (remoteStream) => {
        playStream(remotePeerId, remoteStream); // Play remote stream
      });
    });
  };

  const playStream = (peerId, stream) => {
    if (!videoRefs.current[peerId]) {
      videoRefs.current[peerId] = document.createElement("video");
      document.body.appendChild(videoRefs.current[peerId]);
    }
    const videoElement = videoRefs.current[peerId];
    videoElement.srcObject = stream;
    videoElement.autoplay = true;
  };

  return (
    <div>
      <h1>Your Peer ID: {peerId}</h1>
      <div>
      {peers.map((peer) => (
        <div key={peer.peerId}>
          <h3>Peer: {peer.email}</h3>
          <video ref={(ref) => (videoRefs.current[peer.peerId] = ref)} />
        </div>
      ))}
      </div>
    </div>
  );
};


export default RoomPage;
