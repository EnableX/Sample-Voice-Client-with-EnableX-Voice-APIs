# Sample Client and Walk through of Enablex Voice APIs.
This repository contains the sample application for voice apis.
 
This application demonstrate the feature of the Enablex Voice APIs.
1. Outbound play prompt
1. Outbound play voice menu
1. Outbound play text
1. Outbound call bridging
1. Inbound call voice menu
1. Inbound bridging

## Prerequisite
1. You will need Enablex Application credentials.
1. You will need a Enablex Phone number.
1. You will need a place for hosting this application either cloud or local machine.

## Installation
```
git clone https://github.com/EnableX/Sample-Voice-Client-with-EnableX-Voice-APIs.git --recursive
cd Sample-Voice-Client-with-EnableX-Voice-APIs
npm install
```

## Setting up the Application
1. Create a Enablex voice application using the Enablex portal.
1. Select Inbound or Outbound voice application you want to create.
1. Fill the details, event url properly so that your application server is notified of the call events.
1. For event url, the outbound application by default uses ngrok
1. For inbound, the event url of the voice service needs to be updated with the publicly reachable event url during the service creation. 
1. Purchase a number from Enablex portal (inbound or outbound) associate with inbound or outbound voice application created accordingly.
1. Now enter the app_id, app_key and other configurations in the configuration file, config.js.

## Starting the application
node "sample_name.js"

Replace `sample_name` with name respective scripts like `outgoing_bridging` etc.
