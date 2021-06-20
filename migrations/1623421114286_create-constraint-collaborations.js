exports.up = (pgm) => {
  pgm.addConstraint('collaborations', 'fk_playlist_id.playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');
  pgm.addConstraint('collaborations', 'fk_user_id.user.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('collaborations', 'fk_playlist_id.playlists.id');
  pgm.dropConstraint('collaborations', 'fk_user_id.user.id');
};
