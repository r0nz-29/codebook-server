import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { executeCode } from './codeRunner';
import { SocketModule } from '@nestjs/websockets/socket-module';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CodeRunnerGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server;
  private readonly logger = new Logger('socket-logger');
  users = 0;

  async handleConnection() {
    this.users++;
    this.logger.log(`connected - current: ${this.users}`);
    this.server.emit('users', this.users);
  }

  async handleDisconnect() {
    this.users--;
    this.server.emit('users', this.users);
  }

  @SubscribeMessage('execute')
  async executeCode(client: SocketModule, code) {
    executeCode(client, code);
  }

  @SubscribeMessage('chat')
  async onChat(client, message) {
    this.logger.log('received - ' + message);
    client.broadcast.emit('chat', message);
  }
}
