class ExportsHandler {
  constructor(playlistsService, producerService, validator) {
    this._playlistsService = playlistsService;
    this._producerService = producerService;
    this._validator = validator;
    this.postExportPlaylistsHandler = this.postExportPlaylistsHandler.bind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload);
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const message = {
      userId: credentialId,
      targetEmail: request.payload.targetEmail,
      playlistId,
    };
    await this._producerService.sendMessage('export:playlists', JSON.stringify(message));
    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
