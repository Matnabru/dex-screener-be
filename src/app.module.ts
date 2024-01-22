import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseAdminService } from './firebase/firebase-admin.service';
import { PublicQueryResolver } from './public-query/public-query.resolver';
import { PublicMutationResolver } from './public-mutation/public-mutation.resolver';
import { AuthMutationResolver } from './auth-mutation/auth-mutation.resolver';
import { AuthQueryResolver } from './auth-query/auth-query.resolver';
import { ContinuousService } from './services/listenForEvents';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'], // Adjust this to point to your .graphql schema files
      // other configurations...
    }),
  ],
  controllers: [AppController],
  providers: [AppService, FirebaseAdminService, PublicQueryResolver, PublicMutationResolver, AuthMutationResolver, AuthQueryResolver, ContinuousService],
})
export class AppModule {}
