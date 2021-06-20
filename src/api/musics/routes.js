const routes = (handler) => [
  {
    method: 'POST',
    path: '/songs',
    handler: handler.postMusicHandler,

  },
  {
    method: 'GET',
    path: '/songs',
    handler: handler.getMusicsHandler,

  },
  {
    method: 'GET',
    path: '/songs/{id}',
    handler: handler.getMusicHandler,

  },
  {
    method: 'PUT',
    path: '/songs/{id}',
    handler: handler.putMusicHandler,

  },
  {
    method: 'DELETE',
    path: '/songs/{id}',
    handler: handler.deleteMusicHandler,

  },

];

module.exports = routes;
