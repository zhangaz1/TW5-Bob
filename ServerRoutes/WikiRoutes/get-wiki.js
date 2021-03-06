/*\
title: $:/plugins/OokTech/Bob/ServerRoutes/get-wiki.js
type: application/javascript
module-type: wikiroute

GET /^\/$/
GET /^\/<<fullname>>\/?$/

Returns a wiki

return a function that takes the fullname as the input and returns the route info

\*/
(function() {

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

module.exports = function (fullName) {
  const thePath = (!fullName || fullName === 'RootWiki' || fullName === '')?new RegExp('^\/$'):new RegExp('^\/' + fullName + '\/?$');
  return {
    method: "GET",
    path: thePath,
    handler: function(request,response,state) {
      const token = $tw.Bob.getCookie(request.headers.cookie, 'token');
      const authorised = $tw.Bob.AccessCheck(fullName, token, 'view');
      let text;
      if(authorised) {
        // Make sure we have loaded the wiki tiddlers.
        // This does nothing if the wiki is already loaded.
        const exists = $tw.ServerSide.loadWiki(fullName);
        if(exists) {
          // If servePlugin is not false than we strip out the filesystem
          // and tiddlyweb plugins if they are there and add in the
          // Bob plugin.
          const servePlugin = ($tw.settings['ws-server'].servePlugin !== 'no') ? 'yes' : 'no';
          // Get the full text of the html wiki to send as the response.
          text = $tw.ServerSide.prepareWiki(fullName, servePlugin);
        } else {
          text = "<html><p>No wiki found! Either there is no usable tiddlywiki.info file in the listed location or it isn't listed.</p></html>"
        }

        response.writeHead(200, {"Content-Type": state.server.get("serveType")});
        response.end(text,"utf8");
      }
    }
  }
}

}());
