const { nanoid } = require('nanoid');

const InvariantError = require('../../exceptions/InvariantError');

class PlaylistsongsService {
  constructor(pool, cacheService) {
    this._pool = pool;
    this._cacheService = cacheService;
  }

  async addPlaylistsongs(
    playlistId, songId,
  ) {
    const id = `playlistsong-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
    await this._cacheService.delete(`playlists:${playlistId}`);
    return result.rows[0].id;
  }

  async getPlaylistsongs(
    playlistId,
  ) {
    try {
      const resultCache = await this._cacheService.get(`playlists:${playlistId}`);
      return resultCache;
    } catch (error) {
      const query = {
        text: 'select songs.id, songs.title,songs.performer from songs INNER JOIN playlistsongs ON playlistsongs.song_id = songs.id where playlist_id=$1',
        values: [playlistId],
      };
      const result = await this._pool.query(query);
      const data = result.rows;
      await this._cacheService.set(`playlists:${playlistId}`, JSON.stringify(data));
      return data;
    }
  }

  async deletePlaylistsongs(
    playlistId, songId,
  ) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id= $1 and song_id=$2',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus dari playlist');
    }
    await this._cacheService.delete(`playlists:${playlistId}`);

    return true;
  }
}

module.exports = PlaylistsongsService;
