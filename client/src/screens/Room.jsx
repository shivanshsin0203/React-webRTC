import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

function RoomPage() {
  const [peerId, setPeerId] = useState("");
  const { email } = useParams();
  const roomId = "1";
  const remoteVideoRef = useRef(null);
  const currentUserVideoRef = useRef(null);
  const peerInstance = useRef(null); // Initialize the peerInstance reference
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const peer = new Peer(); // Create a new Peer instance
    peerInstance.current = peer; // Store it in the reference

    // PeerJS setup
    peer.on("open", (id) => {
      setPeerId(id);

      // Initialize Socket.IO after PeerJS is ready
      const Socket = io("https://11be2e6a-dc4e-4110-8aae-b42937a819b6-00-2hxm20xbb07m2.sisko.replit.dev");
      setSocket(Socket);

      // Notify server of user connection
      Socket.emit("userConnect", { roomId, email, peerId: id });

      // Listen for remote peer connections
      Socket.on("addPeer", ({ email: remoteEmail, peerId: remotePeerId }) => {
        if (remoteEmail !== email) {
          handleCall(remotePeerId); // Call the remote peer
        }
      });
    });

    // Handle incoming calls
    peer.on("call", (call) => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((localStream) => {
          currentUserVideoRef.current.srcObject = localStream;
          currentUserVideoRef.current.play();
          call.answer(localStream); // Answer the call with the local stream

          call.on("stream", (remoteStream) => {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play();
          });
        })
        .catch((err) => console.error("Error accessing media devices:", err));
    });

    return () => {
      peer.disconnect();
      socket?.disconnect();
    };
  }, [email]);

  const handleCall = (remotePeerId) => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((localStream) => {
        currentUserVideoRef.current.srcObject = localStream;
        currentUserVideoRef.current.play();

        const call = peerInstance.current.call(remotePeerId, localStream); // Use the peerInstance reference
        call.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        });
      })
      .catch((err) => console.error("Error accessing media devices:", err));
  };

  return (
    <div className="App">
      <h1>Current user id is {peerId}</h1>
      <div>
        <video ref={currentUserVideoRef}  autoPlay />
      </div>
      <div>
        <video ref={remoteVideoRef} autoPlay />
      </div>
    </div>
  );
}

export default RoomPage;
