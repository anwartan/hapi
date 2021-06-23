class CollaborationsHandler {
  constructor(playlistsService, collaborationsService, validator) {
    this._playlistsService = playlistsService;
    this._collaborationsService = collaborationsService;
    this._validator = validator;

    this.postCollaborationsHandler = this.postCollaborationsHandler.bind(this);
    this.deleteSongFromPlaylistHandler = this.deleteCollaborationsHandler.bind(this);
  }

  async postCollaborationsHandler(request, h) {
    try {
      this._validator.validateCollaborationsPayload(request.payload);
      const { userId, playlistId } = request.payload;
      const { id: credentialId } = request.auth.credentials;
      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
      const collaborationId = await this._collaborationsService
        .addCollaboration(playlistId, userId);
      const response = h.response({
        status: 'success',
        message: 'Kolaborasi berhasil ditambahkan',
        data: {
          collaborationId,
        },

      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async deleteCollaborationsHandler(request) {
    try {
      this._validator.validateCollaborationsPayload(request.payload);
      const { userId, playlistId } = request.payload;

      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
      await this._collaborationsService.deleteCollaboration(playlistId, userId);

      return {
        status: 'success',
        message: 'Kolaborasi berhasil dihapus',
      };
    } catch (error) {
      return error;
    }
  }
}

module.exports = CollaborationsHandler;
