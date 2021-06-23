class MusicsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postMusicHandler = this.postMusicHandler.bind(this);
    this.getMusicsHandler = this.getMusicsHandler.bind(this);
    this.getMusicHandler = this.getMusicHandler.bind(this);
    this.putMusicHandler = this.putMusicHandler.bind(this);
    this.deleteMusicHandler = this.deleteMusicHandler.bind(this);
  }

  async postMusicHandler(request, h) {
    this._validator.validateMusicsPayload(request.payload);

    const {
      title, year, performer, genre, duration,
    } = request.payload;
    const musicId = await this._service.addMusic({
      title, year, performer, genre, duration,
    });
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: {
        songId: musicId,
      },
    });
    response.code(201);
    return response;
  }

  async getMusicsHandler() {
    const musics = await this._service.getMusics();
    return {
      status: 'success',
      data: {
        songs: musics,
      },
    };
  }

  async getMusicHandler(request) {
    const { id } = request.params;
    const music = await this._service.getMusicById(id);
    return {
      status: 'success',
      data: {
        song: music,
      },
    };
  }

  async putMusicHandler(request) {
    this._validator.validateMusicsPayload(request.payload);

    const { id } = request.params;

    await this._service.putMusicById(id, request.payload);
    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    };
  }

  async deleteMusicHandler(request) {
    const { id } = request.params;
    await this._service.deleteMusicById(id);
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = MusicsHandler;
