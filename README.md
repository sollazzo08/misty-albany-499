# Senior Capstone
## University at Albany 
####	Made by:
####		* Michael Sollazzo
####		* Kyle Welch
####		* Gabriel Mesidor

## Project :robot:
#### Program Personal Assistant Robot to help Developmentally Disabled Individuals

## Use Cases 

1. Resident Questionnaire
2. Staff/Resident Database (Face Recognition)
3. Sleep Prevention 

### Sponser
 Steve Harding, Living Resources

## Skills recommened for this project
 - Vanilla JavaScript (good understand of JavaScript will help ALOT!)
 - mongoose.js
 - express.js
 - node.js
 - bootstrap
 - Knowledge of MongoDB (NOSQL)
 - Knowledge of googles Dialogflow service
 - Misty SDK [Misty Documentation](https://docs.mistyrobotics.com/)

Note: Misty can be developed with .NET SDK which requires C# knowledge

# Instructions 

### To run project locally:

1. Clone this project to your computer
2. Open the repo with VScode
3. In the root of the Database folder install all dependencies with npm install
3. Go to index.html file inside the staffdashRestAPI folder and open it on a local server
4. To run it on local server use VScode's Go Live extenstion or any other live-server plugins

NOW, you have to configure some settings with MongoDB Atlas and Dialogflow

### MongoDB Atlas Instructions

1. Create a MongoDB atlas account [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a project
3. Build a cluster
4. Connect to cluster 
    - Whitelist a connection IP address 
    - Create a MongoDB User
    - Copy the connection string which should look something like this: 
       mongodb+srv://test:<password>@cluster0-hcuzi.mongodb.net/test?retryWrites=true&w=majority
5. Copy and paste string into config.js
6. You can now run the server/database by running command node app.js in the root of Database folder

### Dialogflow Instructions

### How to use the Misty Interface



