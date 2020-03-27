misty.Debug("Starting captureSpeech skill");

misty.AddReturnProperty("SpeechCaptured", "Filename");
misty.AddReturnProperty("SpeechCaptured", "Success");
misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);

// Registers listener for BumpSensor events
misty.AddReturnProperty("Bumped", "sensorName");
misty.AddReturnProperty("Bumped", "isContacted");
misty.RegisterEvent("Bumped", "BumpSensor", 100, true);

function _Bumped(data) {
    if (data.AdditionalResults[1] == true) {
        switch (data.AdditionalResults[0]) {
            case "Bump_FrontLeft":
                misty.CaptureSpeech(true, true);
                break;
            case "Bump_FrontRight":
                misty.CaptureSpeech(false, true);
                break;
            default:
                return;
        }
    }
}

function _SpeechCaptured(data) {
    misty.Debug("SpeechCaptured!");
    var filename = data.AdditionalResults[0];
    var success = data.AdditionalResults[1];
    misty.Debug(filename);
    misty.Debug("Success = " + success);
    if (success == true) {
        switch (filename) {
            case "capture_Dialogue.wav":
                misty.Debug("captured recording without wake word - " + filename); 
                misty.PlayAudio(filename);
                break;
            case "capture_HeyMisty.wav":
                misty.Debug("captured recording after wake word - " + filename);
                misty.PlayAudio(filename);
                break;
            default:
                return;
        }
    }
}