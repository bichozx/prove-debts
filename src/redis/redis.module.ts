import { Global, Module } from '@nestjs/common';

import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        console.log('🔧 Creating Redis client...');

        const client = new Redis({
          host: 'localhost',
          port: 6380,
          lazyConnect: false, // Conectar inmediatamente
        });

        client.on('connect', () => {
          console.log('✅ Redis: Connected to localhost:6380');
        });

        client.on('ready', () => {
          console.log('🚀 Redis: Ready to accept commands');
        });

        client.on('error', (err) => {
          console.error('❌ Redis error:', err.message);
        });

        // Hacer una prueba directa
        client
          .set('startup-test', 'hello', 'EX', 300)
          .then(() => {
            console.log('🧪 Redis: Test write successful');
          })
          .catch((err) => {
            console.error('❌ Redis: Test write failed:', err);
          });

        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
