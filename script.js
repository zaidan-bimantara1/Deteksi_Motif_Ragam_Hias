let model, webcam, labelContainer, maxPredictions;
let isWebcamOn = false;

const video = document.getElementById('webcam');

async function initWebcam() {
    const modelURL = "./model/model.json";
    const metadataURL = "./model/metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
                video.play();
                isWebcamOn = true;
                loop(); // Mulai prediksi setelah webcam menyala
            })
            .catch(function (error) {
                console.log("Error accessing webcam: ", error);
            });
    } else {
        console.log("Webcam not supported by your browser.");
    }

    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
}

function stopWebcam() {
    if (isWebcamOn) {
        const stream = video.srcObject;
        const tracks = stream.getTracks();

        tracks.forEach(function(track) {
            track.stop();
        });

        video.srcObject = null;
        isWebcamOn = false;
    }
}

async function loop() {
    if (isWebcamOn) {
        await predict();
        window.requestAnimationFrame(loop);
    }
}

async function predict() {
    const prediction = await model.predict(video);
    const labelContainer = document.getElementById('label-container');
    labelContainer.innerHTML = ''; // Clear existing predictions

    prediction.forEach((pred, i) => {
        const className = pred.className.toLowerCase().replace(/\s+/g, ''); // Remove spaces for class names
        const classPrediction = `${pred.className}: ${(pred.probability * 100).toFixed(2)}%`;
        const progressBar = `
            <div class="progress">
                <div class="progress-bar ${className}" role="progressbar" style="width: ${pred.probability * 100}%;" aria-valuenow="${pred.probability * 100}" aria-valuemin="0" aria-valuemax="100">${classPrediction}</div>
            </div>`;
        labelContainer.innerHTML += progressBar;
    });
}

function toggleWebcam() {
    if (isWebcamOn) {
        stopWebcam();
        document.getElementById("toggle-webcam").innerText = "Turn ON Webcam";
    } else {
        initWebcam();
        document.getElementById("toggle-webcam").innerText = "Turn OFF Webcam";
    }
}

document.getElementById("toggle-webcam").addEventListener("click", toggleWebcam);
