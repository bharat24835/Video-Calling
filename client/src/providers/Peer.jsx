import React, { useMemo, useEffect, useState, useCallback } from "react";


const PeerContext = React.createContext();

export const usePeer = () => React.useContext(PeerContext)


export const PeerProvider = (props) => {

    const [remoteStream, setRemoteStream] = useState(null);
    const peer = useMemo(() => new RTCPeerConnection({
        iceServers: [{
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:global.stun.twilio.com:3478"
            ]
        }]
    }), []);

    // this peer variable contaiin the details of system (like public ip address)
    // now create this offer

    // RTC PeerConnection are used as ICE/STURN SERVERS to get the IP ADDRESS

    const createOffer = async () => {
        const offer = await peer.createOffer();// not this offer we want to save in our local description 
        await peer.setLocalDescription(offer);
        return offer;
    }

    const createAnswer = async (offer) => {
        // jo offer hmare pass aee hai , voh humai apne remote description mai save karna hoga
        await peer.setRemoteDescription(offer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        return answer;
    }


    const setRemoteAnswer = async (ans) => {
        await peer.setRemoteDescription(ans);
    }


    const sendStream = async (stream) => {
        const tracks = stream.getTracks();

        for (const track of tracks) {
            peer.addTrack(track, stream);
        }

    }

    const handleTrackEvent = useCallback((ev) => {
        const streams = ev.streams;
        setRemoteStream(streams[0]);
    }, [])

    

    useEffect(() => {
        peer.addEventListener('track', handleTrackEvent);
        
         
        return () => {
            // hr re-rendering pr event listener add hote rahenge 
            peer.removeEventListener('track', handleTrackEvent);        
            

        }
    }, [peer, handleTrackEvent ])


    return (
        <PeerContext.Provider value={{ peer, createOffer, createAnswer, setRemoteAnswer, sendStream  , remoteStream }}>
            {props.children}
        </PeerContext.Provider>
    )
}