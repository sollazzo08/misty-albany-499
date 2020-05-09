/***************************************************************************************
*    This file is used to help Misty connect to the DialogFlow API and Text-to-Speech API, 
*    and verbally communicate with a resident. 
*
* 
*   We borrowed lines 11-144, 395-462(ish) from:
*        https://github.com/MistySampleSkills/Misty-Concierge-Template/blob/master/JavaScript/conciergeBaseTemplate/conciergeBaseTemplate.js
*   However, some of it has been modified to match more along our needs for the project.
*/

getAccessToken();

function initiateTokenRefresh() {
    misty.Set("googleAuthToken", "not updated yet", false);
    _getAuthToken();
    misty.RegisterTimerEvent("getAuthToken", 60000 * 15, true);
}
initiateTokenRefresh();

function _getAuthToken() {
    misty.SendExternalRequest("POST", misty.Get("cloudFunctionAuthTokenURL"), null, null, null, false, false, null, "application/json", "_UpdateAuthToken");
}

function _UpdateAuthToken(data) 
{
    misty.Set("googleAuthToken", JSON.parse(data.Result.ResponseObject.Data).authToken, false);
    misty.Debug("Updated Auth Token");
}


//These are the necessary credentials needed to log into DialogFlow API and Text-to-Speech API. 
function creds(){
    misty.Set("cloudFunctionAuthTokenURL", "https://us-central1-mistyvoicecommand-otapmj.cloudfunctions.net/get-access-token", false);
    misty.Set("GoogleCloudProjectID", "mistyvoicecommand-otapmj", false);
    misty.Set("langCodeForTTS", "en-US", false);
    misty.Set("genderCodeForTTS", "FEMALE", false);
}
creds();

//Creates a unique session ID for opening a session with our Dialogflow agent
function getSessionId(){
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Gets an access token for use with DialogFlow API
function getAccessToken(){
    misty.SendExternalRequest("POST",  _params.getAccessTokenUrl, null, null, null, false, false, null, "application/json", "SetAccessToken");
}

// We set the access token, and then Misty will start to listen for her keyphrase (Hey, Snapdragon!)
function SetAccessToken(data) {
    let response = JSON.parse(data.Result.ResponseObject.Data)
    misty.Set("googleAccessToken", response.accessToken);

    startToListen();
}

/* 
*   Misty animates her standard position (line 395-ish), and will start to listen for her keyphrase. She will trigger a 
*   noise, and then will capture the input with her mic
*/
function startToListen() {
    animateStandard();

    misty.AddReturnProperty("VoiceRecord", "Filename");
    misty.AddReturnProperty("VoiceRecord", "Success");
    misty.AddReturnProperty("VoiceRecord", "ErrorCode");
    misty.AddReturnProperty("VoiceRecord", "ErrorMessage");
    misty.RegisterEvent("VoiceRecord", "VoiceRecord", 10, true);

    misty.Pause(1000);
    misty.ChangeLED(255, 255, 255);

    misty.Debug("Misty is listening, say 'Hey, Snapdragon' to start!");
    misty.PlayAudio("s_Joy3.wav");
    misty.DisplayImage("e_Content.jpg");

    // We start key phrase recognition and set voice recording to begin
    // immediately after Misty heads the wake word ("Hey, Misty")
    misty.StartKeyPhraseRecognition(true, true, 15000);
}

// Misty's register event. This will process the audio file of the user's vocal input.
function _VoiceRecord(data){
    let filename = data.AdditionalResults[0];
    misty.Debug("Speech captured.")
    misty.GetAudioFile(filename, "ProcessAudioFile");
    ProcessAudioFile(filename);
}

/* USELESS!!!!!!!!!
function _SpeechCaptured(data) {
    misty.Debug("SpeechCaptured!");
    let filename = data.AdditionalResults[0];
    let success = data.AdditionalResults[1];
    misty.Debug(filename);
    misty.Debug("Success = " + success);
    if (success == true && filename == "capture_Dialogue.wav"){
            misty.Debug("captured recording after wake word - " + filename);
    }
    misty.Debug("Time to Process " + filename);
    misty.GetAudioFile(filename, "ProcessAudioFile");
}
*/

/*
*   Sends speech recording to DialogFlow. Dialogflow uses speech-to-text to match the recording with an "intent" 
*   we define in the DialogFlow project (look over the README if there is confusion on how to work with intents), 
*   then sends a response back with intent data. We use this response data to change Misty's LED.
*/
function ProcessAudioFile(data) {
    //This usually doesn't work
    //misty.Debug("Process Audio File: " + data);

    // Set variable with base64 data for the audio file
    let base64 = data.Result.Base64;

    // Set up params for request to DialogFlow
    let sessionId = getSessionId();
	let url = "https://dialogflow.googleapis.com/v2/projects/" + _params.projectID + "/agent/sessions/" + sessionId + ":detectIntent";
    let authorizationType =  "Bearer";
    let dialogFlowParams = JSON.stringify({
        "queryInput": {
            "audioConfig": {
                "audioEncoding": "AUDIO_ENCODING_LINEAR_16",
                "languageCode": "en-US",
                "sampleRateHertz": 16000
            }
        },
        "inputAudio": base64
    });

    let accessToken = misty.Get("googleAccessToken");
    misty.Pause(4000);
    misty.SendExternalRequest("POST", url, authorizationType, accessToken, dialogFlowParams, false, false, null, "application/json", "ProcessDialogFlowResponse");
}

/*
*   Handles response from Dialogflow agent. Use a series of if-else checks to see which intent was matched by DialogFlow,
*   call the speakTheText() function if you want Misty to vocally respond to a user. 
*
*   The idea was gathered from the link above but it was heavily modified to fit our needs.
*/
function ProcessDialogFlowResponse(data) {
    
    // Gets the intent and parameters from the response
    let response = JSON.parse(data.Result.ResponseObject.Data)
    let intent = response.queryResult.intent.displayName;
    let parameters = response.queryResult.parameters;

    // Prints some debug messages with contents of the response
    misty.Debug("Intent: " + intent);
    misty.Debug("Input text: " + response.queryResult.queryText);

    // If-else intent pairing we get from DialogFlow
    if(intent == "Confirm"){
        misty.Debug("All right.");
        misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
        speakTheText();
        misty.Pause(4000);
        startToListen();
    }
    if (intent == "ChangeLED") {
        misty.Debug("Color: " + parameters.color);
        switch(parameters.color) {
            case "red":
                misty.ChangeLED(255, 0, 0);
                misty.Pause(2000);
                misty.Pause(5000);
                misty.CaptureSpeech(false, true);
                misty.Pause(2000);
                misty.AddReturnProperty("SpeechCaptured", "Filename");
                misty.AddReturnProperty("SpeechCaptured", "Success");
                misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
                break;
            case "blue":
                misty.Change
                misty.Pause(5000);
                misty.CaptureSpeech(false, true);
                misty.Pause(2000);
                misty.AddReturnProperty("SpeechCaptured", "Filename");
                misty.AddReturnProperty("SpeechCaptured", "Success");
                misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
            case "green":
                misty.ChangeLED(0, 255, 0);
                animateCompliance();
                misty.Pause(5000);
                misty.CaptureSpeech(false, true);
                misty.Pause(2000);
                misty.AddReturnProperty("SpeechCaptured", "Filename");
                misty.AddReturnProperty("SpeechCaptured", "Success");
                misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
                break;
            case "yellow":
                misty.ChangeLED(255,255,51);
                animateCompliance();
                misty.Pause(5000);
                misty.CaptureSpeech(false, true);
                misty.Pause(2000);
                misty.AddReturnProperty("SpeechCaptured", "Filename");
                misty.AddReturnProperty("SpeechCaptured", "Success");
                misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
                break;
            case "orange":
                misty.ChangeLED(255,128,0);
                animateCompliance();
                misty.Pause(5000);
                misty.CaptureSpeech(false, true);
                misty.Pause(2000);
                misty.AddReturnProperty("SpeechCaptured", "Filename");
                misty.AddReturnProperty("SpeechCaptured", "Success");
                misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
                break;
            case "pink":
                misty.ChangeLED(255,51,187);
                animateComplaince();
                misty.Pause(5000);
                misty.CaptureSpeech(false, true);
                misty.Pause(2000);
                misty.AddReturnProperty("SpeechCaptured", "Filename");
                misty.AddReturnProperty("SpeechCaptured", "Success");
                misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
                break;
            case "white":
                misty.ChangeLED(255, 255, 255);
                animateComplaince();
                misty.Pause(5000);
                misty.CaptureSpeech(false, true);
                misty.Pause(2000);
                misty.AddReturnProperty("SpeechCaptured", "Filename");
                misty.AddReturnProperty("SpeechCaptured", "Success");
                misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
                break;
            case "random":
                misty.ChangeLED(Math.floor((Math.random() * 255) + 1), Math.floor((Math.random() * 10) + 1), Math.floor((Math.random() * 10) + 1));
                animateComplaince();
                misty.Pause(5000);
                misty.CaptureSpeech(false, true);
                misty.Pause(2000);
                misty.AddReturnProperty("SpeechCaptured", "Filename");
                misty.AddReturnProperty("SpeechCaptured", "Success");
                misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
                break;
            default:
                misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
                speakTheText();
                misty.Pause(5000);
                misty.CaptureSpeech(false, true);
                misty.Pause(2000);
                misty.AddReturnProperty("SpeechCaptured", "Filename");
                misty.AddReturnProperty("SpeechCaptured", "Success");
                misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
                break;
        }
    }
    else if(intent == "Questionaire"){
        animateStandard();
        misty.Pause(2000);
        misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
        speakTheText();
        misty.Pause(3000);
        //startToListen();
        misty.CaptureSpeech(false, true);
        misty.Pause(2000);
        misty.AddReturnProperty("SpeechCaptured", "Filename");
        misty.AddReturnProperty("SpeechCaptured", "Success");
        misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
    }
    else if(intent == "Questionnaire - NotFeelingOkay"){
        misty.Pause(1000);
        animateSadness();
        misty.Pause(2000);
        misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
        speakTheText();
        misty.Pause(4000);
        misty.CaptureSpeech(false, true);
        misty.Pause(2000);
        misty.AddReturnProperty("SpeechCaptured", "Filename");
        misty.AddReturnProperty("SpeechCaptured", "Success");
        misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
    }
    else if(intent == "Questionnaire - NotFeelingOkay - WantToTalk"){
        misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
        speakTheText();
        misty.Pause(5000);
        misty.CaptureSpeech(false, true);
        misty.Pause(2000);
        misty.AddReturnProperty("SpeechCaptured", "Filename");
        misty.AddReturnProperty("SpeechCaptured", "Success");
        misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
    }
    else if(intent == "Questionnaire - NotFeelingOkay - DontWantToTalk"){
        misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
        speakTheText();
        misty.Pause(5000);
        misty.CaptureSpeech(false, true);
        misty.Pause(2000);
        misty.AddReturnProperty("SpeechCaptured", "Filename");
        misty.AddReturnProperty("SpeechCaptured", "Success");
        misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
    }
    else if(intent == "Questionnaire - FeelingOkay"){
        animateCompliance();
        misty.Pause(2000);
        misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
        speakTheText();
        misty.Pause(8000);
        misty.CaptureSpeech(false, true);
        misty.Pause(2000);
        misty.AddReturnProperty("SpeechCaptured", "Filename");
        misty.AddReturnProperty("SpeechCaptured", "Success");
        misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
    }
    else if(intent == "Questionnaire - FeelingOkay - SomethingHurts"){
        misty.Pause(1000);
        animateSadness();
        misty.Pause(2000);
        misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
        speakTheText();
        misty.Pause(5000);
        misty.CaptureSpeech(false, true);
        misty.Pause(2000);
        misty.AddReturnProperty("SpeechCaptured", "Filename");
        misty.AddReturnProperty("SpeechCaptured", "Success");
        misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true); 
    }
    else if(intent == "Questionnaire - NeedHelp"){
        animateCompliance();
        misty.Pause(2000);
        misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
        speakTheText();
        misty.Pause(5000);
        misty.CaptureSpeech(false, true);
        misty.Pause(2000);
        misty.AddReturnProperty("SpeechCaptured", "Filename");
        misty.AddReturnProperty("SpeechCaptured", "Success");
        misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
    }
    else if(intent == "Questionnaire - DontNeedHelp"){
        misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
        speakTheText();
        misty.Pause(5000);
        misty.CaptureSpeech(false, true);
        misty.Pause(2000);
        misty.AddReturnProperty("SpeechCaptured", "Filename");
        misty.AddReturnProperty("SpeechCaptured", "Success");
        misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
    }
    else if(intent == "Questionnaire - NothingWrong"){
        misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
        speakTheText();
        misty.Pause(5000);
        misty.CaptureSpeech(false, true);
        misty.Pause(2000);
        misty.AddReturnProperty("SpeechCaptured", "Filename");
        misty.AddReturnProperty("SpeechCaptured", "Success");
        misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
    }
    else if(intent == "Questionnaire - SomethingWrong"){
        animateSadness();
        misty.Pause(2000);
        misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
        speakTheText();
        misty.Pause(5000);
        misty.CaptureSpeech(false, true);
        misty.Pause(2000);
        misty.AddReturnProperty("SpeechCaptured", "Filename");
        misty.AddReturnProperty("SpeechCaptured", "Success");
        misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
    }
    else if(intent == "Cancel"){
        misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
        speakTheText();
        misty.Pause(5000);
        misty.CancelSkill("22a75504-95b3-4e57-b0ba-bb476ffb4bce");
    }
    else {
        animateInterest();
        misty.Pause(2000);
        misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
        speakTheText();
        misty.Pause(5000);
        misty.CaptureSpeech(false, true);
        misty.Pause(2000);
        misty.AddReturnProperty("SpeechCaptured", "Filename");
        misty.AddReturnProperty("SpeechCaptured", "Success");
        misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
    }
}

/*  Our animate functions. These help Misty be a bit more realistic.
*
*   animateCompliance was borrowed from link mentioned above.
*/
function animateCompliance() {
    misty.MoveHeadDegrees(-15, 0, 0, 100);
    misty.PlayAudio("s_Acceptance.wav");
    misty.DisplayImage("e_Joy2.jpg");
    misty.MoveArms(0, -25, 100, 100);
}

function animateSadness() {
    misty.MoveHeadDegrees(25, 0, 0, 100);
    misty.PlayAudio("e_Sadness.wav");
    misty.DisplayImage("e_RemoreseSadness.jpg");
    misty.MoveArms(0, 0, 100, 100);
}

function animateInterest() {
    misty.MoveHeadDegrees(-15, 0, 0, 100);
    misty.DisplayImage("e_Confusion.jpg");
    misty.MoveArms(-25, 25, 100, 100);
}

function animateStandard() {
    misty.MoveHeadDegrees(-10, 0, 0, 100);
    misty.DisplayImage("e_DefaultContent.jpg");
    misty.MoveArms(0, 0, 100, 100);
}

// BROKEN!!!!!
/*
function playRegisterNoise() {
    misty.PlayAudio("s_SystemSuccess.wav");
}
*/

// This uses the TTS API and gets Misty to read out the text that was produced by DialogFlow.
function speakTheText() {
    var arguments = JSON.stringify({
        'input': {
            'text': misty.Get("textToSpeak")
        },
        'voice': {
            'languageCode': misty.Get("langCodeForTTS"),
            'ssmlGender': misty.Get("genderCodeForTTS")
        },
        'audioConfig': {
            'audioEncoding': "LINEAR16",
            "effectsProfileId": [
                "handset-class-device"
            ],
            "pitch": 5,
            "speakingRate": 0.91
        }
    });

    misty.Debug("Sending Data to Google");
    misty.SendExternalRequest("POST", "https://texttospeech.googleapis.com/v1beta1/text:synthesize", "Bearer", misty.Get("googleAccessToken"), arguments, false, false, null, "application/json", "_Base64In")
    misty.Debug("Text sent to Google Text to Speech API");
}

// Turn the audio file to Base64.
function _Base64In(data) {
    misty.Debug("Audio(base64) in from Google TTS API");
    misty.Debug(JSON.stringify(data));

    misty.Set("playingAudio", true, false);

    // Saves and plays the Base64-encoded audio data 
    misty.SaveAudio("tts.wav", JSON.parse(data.Result.ResponseObject.Data).audioContent, true, true);
}