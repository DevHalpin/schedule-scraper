const { google } = require('googleapis');
const fs = require('fs');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = 'token.json';

const authenticate = async () => {
    const { client_secret, client_id, redirect_uris } = JSON.parse(fs.readFileSync('credentials.json')).installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    if (fs.existsSync(TOKEN_PATH)) {
        oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)));
        return oAuth2Client;
    } else {
        console.log('No token found. Generating new token...');
        
        return await getNewToken(oAuth2Client);
    }
}

function getNewToken(oAuth2Client) {
    return new Promise((resolve, reject) => {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });

        console.log('Authorize this app by visiting this URL:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) {
                    console.error('Error retrieving access token', err);
                    reject(err);
                    return;
                } 
                oAuth2Client.setCredentials(token);
                fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
                console.log('Token stored to', TOKEN_PATH);
                resolve(oAuth2Client);
            });
        });
    })
}

module.exports = authenticate;