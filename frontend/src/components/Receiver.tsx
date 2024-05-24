import { useEffect, useRef, useState } from "react"


export const Receiver = () => {
    const [recieverSocket, setSocket] = useState<WebSocket | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'receiver'
            }));
        }
        setSocket(socket);
        startReceiving(socket);
    }, []);


    // recieverSocket.onmessage = (event) => {
    //     const message = JSON.parse(event.data);
    //     if (message.type === 'createOffer') {
    //         pc.setRemoteDescription(message.sdp).then(() => {
    //             pc.createAnswer().then((answer) => {
    //                 pc.setLocalDescription(answer);
    //                 socket.send(JSON.stringify({
    //                     type: 'createAnswer',
    //                     sdp: answer
    //                 }));
    //             });
    //         });
    //     } else if (message.type === 'iceCandidate') {
    //         pc.addIceCandidate(message.candidate);
    //     }
    // }

    function startReceiving(socket: WebSocket) {
        const video = document.createElement('video');
        document.body.appendChild(video);

        const pc = new RTCPeerConnection();
        pc.ontrack = (event) => {
            console.log("TRACK ADDED -> ", event);
            if(videoRef.current) {
                videoRef.current.srcObject = new MediaStream([event.track]);
            }
            video.srcObject = new MediaStream([event.track]);
            video.muted = true;
            video.play();
        }

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'createOffer') {
                pc.setRemoteDescription(message.sdp).then(() => {
                    pc.createAnswer().then((answer) => {
                        pc.setLocalDescription(answer);
                        socket.send(JSON.stringify({
                            type: 'createAnswer',
                            sdp: answer
                        }));
                    });
                });
            } else if (message.type === 'iceCandidate') {
                pc.addIceCandidate(message.candidate);
            }
        }
    }

    return <div>
        <video ref={videoRef}></video>
    </div>
}