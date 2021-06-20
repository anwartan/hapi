const { nanoid } = require('nanoid');

const InvariantError = require('../../exceptions/InvariantError');

class PlaylistsongsService {
  constructor(pool) {
    this._pool = pool;
  }

  async addPlaylistsongs(
    playlistId, songId,
  ) {
    const id = nanoid(16);
    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
    return result.rows[0].id;
  }

  async getPlaylistsongs(
    playlistId,
  ) {
    const query = {
      text: 'select songs.id, songs.title,songs.performer from songs INNER JOIN playlistsongs ON playlistsongs.song_id = songs.id where playlist_id=$1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows;
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
    return true;
  }
}

module.exports = PlaylistsongsService;
