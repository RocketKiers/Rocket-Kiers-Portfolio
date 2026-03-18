    document.getElementById("audio")
        .addEventListener("change", (event) => {
            const file = event.target.files[0];

            const reader = new FileReader();

            reader.addEventListener("load", (event) => {
                const arrayBuffer = event.target.result;

                const audioContext = new (window.AudioContext || window.webkitAudiocontext)();


                audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
                    visualize(audioBuffer, audioContext);
                });
            })

            reader.readAsArrayBuffer(file);
        });

function visualize(audioBuffer, audioContext) {
    const canvas = document.getElementById("canvas");
    canvas.width = 1000;
    canvas.height = 300;
    
    const analyser = audioContext.createAnalyser();
    analyser.fftSize =2**8;

    const frequencyBufferLength = analyser.frequencyBinCount;
    const frequencyData = new Uint8Array(frequencyBufferLength);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    source.start();

    const canvasContext = canvas.getContext("2d");

    const barWidth = canvas.width / frequencyBufferLength;

        function draw() {
        requestAnimationFrame(draw);
        canvasContext.fillStyle = "#fcba03";
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);

        analyser.getByteFrequencyData(frequencyData);

        canvasContext.font = "12px Arial";
        canvasContext.fillStyle = "black";
        canvasContext.textAlign = "center";

        for(let i = 0; i < frequencyBufferLength; i++) {
            const opacity = frequencyData[i] / 255;
            const barHeight = frequencyData[i];
            canvasContext.fillStyle = `rgba(82, 113, 255, ${opacity})`;

            canvasContext.fillRect(
                i * barWidth, 
                canvas.height - barHeight, 
                barWidth - 1,
                barHeight
            );
            if (
                frequencyData[i] === 255 &&
                (i === frequencyBufferLength - 1 || frequencyData[i + 1] < 255)
            ) {
                const frequency = i * (audioContext.sampleRate / 2) / frequencyBufferLength;
                const freqText = Math.round(frequency) + " Hz";

                canvasContext.fillStyle = "black";
                canvasContext.fillText(
                    freqText,
                    i * barWidth + barWidth / 2,
                    canvas.height - barHeight - 10
                );
            }
        }
    }

    draw();
}
