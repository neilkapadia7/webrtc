import { useEffect, useRef, useState } from "react"


export const Receiver = () => {
    // const [recieverSocket, setSocket] = useState<WebSocket | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'receiver'
            }));
        }
        // setSocket(socket);
        startReceiving(socket);
    }, []);



    function startReceiving(socket: WebSocket) {
        const video = document.createElement('video');
        document.body.appendChild(video);

        const pc = new RTCPeerConnection();
        pc.ontrack = (event) => {
            console.log("TRACK ADDED -> ", event);
            if(videoRef.current) {
                videoRef.current.srcObject = new MediaStream([event.track]);
                videoRef.current.muted = true;
                videoRef.current.play()
            }
        //     video.srcObject = new MediaStream([event.track]);
        //     video.muted = true;
        //     video.play();
        }

        // pc.onicecandidate = (event) => {
        //     if (event.candidate) {
        //         socket?.send(JSON.stringify({
        //             type: 'iceCandidate',
        //             candidate: event.candidate
        //         }));
        //     }
        // }

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'createOffer') {
                console.log("OFFER ADDED!")
                pc.setRemoteDescription(message.sdp).then(() => {
                    console.log("OFFER ADDED! 1")
                    pc.createAnswer().then((answer) => {
                        console.log("OFFER ADDED! 2 ! ANSWER CREATED")
                        pc.setLocalDescription(answer);
                        socket.send(JSON.stringify({
                            type: 'createAnswer',
                            sdp: answer
                        }));
                    });
                });
            } else if (message.type === 'iceCandidate') {
                console.log("REMOTE ICE CANDIDATE ADDED", message.candidate)
                pc.addIceCandidate(message.candidate);
            }
        }
    }

    return <div>
        <video ref={videoRef}></video>
    </div>
}