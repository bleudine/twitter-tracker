First create a ``.env`` file inside the `server` folder with the following content and correct API keys:


````
CONSUMER_KEY=XXXXXXXXXXXXXXXXXXXXXXXXX
CONSUMER_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
ACCESS_TOKEN_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
ACCESS_TOKEN_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
````

then in two separate terminal instances: 

- ``cd front && npm i && npm run start``
- ``cd server && npm i && node index.js``