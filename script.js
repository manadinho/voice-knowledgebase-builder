window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let ELEMENT = null;

if (typeof window.SpeechRecognition === "undefined") {
  alert("Sorry, your browser does not support Speech Recognition.");
} else {
  const saveBtn = document.getElementById("knowledgebase_submit_btn");
  let transcript = "";
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    transcript = Array.from(event.results)
      .map((result) => result[0])
      .map((result) => result.transcript)
      .join("");

    const transcriptArray = transcript.split(" ");
    let newTranscript = "";
    for (let i = 0; i < transcriptArray.length; i++) {
      if (transcriptArray[i] === "line" && transcriptArray[++i] === "break") {
        newTranscript += "\n";
      } else if (
        transcriptArray[i] === "recording" &&
        transcriptArray[++i] === "done"
      ) {
        endRecording();
      } else {
        newTranscript += transcriptArray[i] + " ";
      }
    }

    ELEMENT.value = newTranscript;

    transcript = "";
  };

  recognition.onerror = (event) => {
    console.error("Recognition error: ", event.error);
  };

  document.querySelectorAll("#title, #description").forEach((elem) => {
    elem.addEventListener("focus", () => {
      if (!checkRecordingEnabled()) {
        return;
      }

      startRecording(elem);
    });

    elem.addEventListener("focusout", () => {
      if (!checkRecordingEnabled()) {
        return;
      }
      endRecording(elem);
    });
  });

  function checkRecordingEnabled() {
    return document.getElementById("enable_text_to_speech").checked;
  }

  function startRecording(el) {
    recognition.stop();
    ELEMENT = el;
    transcript = "";
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        recognition.start();
      })
      .catch((err) => {
        console.error("You denied access to the microphone", err);
      });
  }

  function endRecording() {
    ELEMENT = null;
    recognition.stop();
  }

  function doCorrectionWithAi(fieldType, fieldName, transcript) {
    return new Promise((resolve, reject) => {
      if (transcript === "") {
        resolve(transcript);
        return;
      }

      const data = {
        text: transcript,
      };

      fetch("http://localhost:3500/api/v1/transcribe", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((result) => {
          console.log(result);
          resolve(result.data.text);
        });
    });
  }

  saveBtn.addEventListener("click", saveToNotion);

  function saveToNotion(event) {
    // prevent form submission
    event.preventDefault();

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;

    fetch("http://localhost:3500", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ title, description }),
    })
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        document.getElementById("title").value = "";
        document.getElementById("description").value = "";
      });
  }
}
