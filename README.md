# ScreenSync
---------
Sync your browser across two users to collaborate on projects! Sync your mouse cursor onto the other person's window, as well as scrolling and changing url

### Installation
All that's required to use is to load the `frontend` folder as an extension in chrome. By default it will use a server we are hosting
to route all messages. To use your own server, configure `backEnd/index.js` to your domain, then update `prodServer` in `frontEnd/background.js`
to point to your own domain. Installing the chrome extension (or updating it so the changes take effect), and starting `backEnd/index.js` in node
will create your own server for the extension.