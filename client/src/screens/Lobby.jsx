import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { io } from "socket.io-client";
import { useParams } from 'react-router-dom';
function LobbyScreen() {
  const [peerId, setPeerId] = useState('');
  const { email } = useParams();
  const [remotePeerIdValue, setRemotePeerIdValue] = useState('');
  const remoteVideoRef = useRef(null);
  const currentUserVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const [socket , setSocket] = useState(null);
  useEffect(() => {
    const peer = new Peer();

    peer.on('open', (id) => {
      setPeerId(id)
    });
    const Socket=io("localhost:8000");
    setSocket(Socket);
    Socket.on('connect', () => {
      console.log('connected')
    })
    Socket.emit("")
    peer.on('call', (call) => {
      var getUserMedia = navigator.getUserMedia 
      || navigator.webkitGetUserMedia 
      || navigator.mozGetUserMedia;

      getUserMedia({ video: true, audio: true }, (mediaStream) => {
        currentUserVideoRef.current.srcObject = mediaStream;
        currentUserVideoRef.current.play();
        call.answer(mediaStream)
        call.on('stream', function(remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream
          remoteVideoRef.current.play();
        });
      });
    })
  peerInstance.current = peer;
  }, [])
  const call = (remotePeerId) => {
    var getUserMedia = navigator.getUserMedia 
    || navigator.webkitGetUserMedia 
    || navigator.mozGetUserMedia;

    getUserMedia({ video: true, audio: true }, (mediaStream) => {

      currentUserVideoRef.current.srcObject = mediaStream;
      currentUserVideoRef.current.play();

      const call = peerInstance.current.call(remotePeerId, mediaStream)

      call.on('stream', (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream
        remoteVideoRef.current.play();
      });
    });
  }
  return (
    <div className="App">
        <h1>Current user id is {peerId}</h1>
        <input type="text" value={remotePeerIdValue} onChange={e => setRemotePeerIdValue(e.target.value)} />
        <button onClick={() => call(remotePeerIdValue)}>Call</button>
        <div>
          <video ref={currentUserVideoRef} />
        </div>
        <div>
          <video ref={remoteVideoRef} />
        </div>
      </div>
    
  );
}

export default LobbyScreen;
