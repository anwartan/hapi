require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const { Pool } = require('pg');
const path = require('path');
const Inert = require('@hapi/inert');

const musics = require('./api/musics');
const users = require('./api/users');
const authentications = require('./api/authentications');
const playlists = require('./api/playlists');
const collaborations = require('./api/collaborations');
const _exports = require('./api/exports');
const uploads = require('./api/uploads');
const MusicsService = require('./services/postgres/MusicsService');
const UsersService = require('./services/postgres/UsersService');
const AuthenticationsService = require('./services/postgres/AuthenticationService');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsongsService = require('./services/postgres/PlaylistsongsService');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const ProducerService = require('./services/rabbitmq/ProducerService');
const StorageService = require('./services/storage/StorageService');
const CacheService = require('./services/redis/CacheService');
const TokenManager = require('./tokenize/TokenManager');
const MusicsValidator = require('./validator/musics');
const UsersValidator = require('./validator/users');
const AuthenticationsValidator = require('./validator/authentications');
const PlaylistsValidator = require('./validator/playlists');
const CollaborationsValidator = require('./validator/collaborations');
const ExportsValidator = require('./validator/exports');
const UploadsValidator = require('./validator/uploads');
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
  });
  const cacheService = new CacheService();
  const musicsService = new MusicsService(pool);
  const usersService = new UsersService(pool);
  const authenticationsService = new AuthenticationsService(pool);
  const playlistsongsService = new PlaylistsongsService(pool, cacheService);
  const collaborationsService = new CollaborationsService(pool);
  const playlistsService = new PlaylistsService(pool, collaborationsService);
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({

      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: musics,
      options: {
        service: musicsService,
        validator: MusicsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        validator: AuthenticationsValidator,
        tokenManager: TokenManager,
      },
    },
    {
      plugin: playlists,
      options: {
        playlistsService,
        playlistsongsService,
        validator: PlaylistsValidator,

      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,

      },
    },
    {
      plugin: _exports,
      options: {
        playlistsService,
        producerService: ProducerService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
      },
    },
  ]);
  await server.start();
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    if (!response.statusCode) {
      const newResponse = h.response({
        status: 'fail',
        message: response.output.payload.message,
      });
      newResponse.code(response.output.payload.statusCode);
      return newResponse;
    }

    if (response instanceof ClientError) {
      // membuat response baru dari response toolkit sesuai kebutuhan error handling
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    // jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    const success = h.response(response.source);
    success.code(response.statusCode);
    return success;
  });
};

init();
