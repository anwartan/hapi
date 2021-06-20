const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/musics',
    handler: handler.postExportNotesHandler,
    options: {
      auth: 'musicapp_jwt',
    },
  },
];

module.exports = routes;
