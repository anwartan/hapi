const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, { playlistsService, playlistsongsService, validator }) => {
    const playlistHandler = new PlaylistsHandler(playlistsService, playlistsongsService, validator);
    server.route(routes(playlistHandler));
  },
};
