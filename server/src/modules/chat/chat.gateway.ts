import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client kết nối Socket: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ngắt kết nối Socket: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    client.join(data.roomId);
    this.logger.log(`Client ${client.id} đã vào phòng chat ${data.roomId}`);
    return { event: 'joined_room', roomId: data.roomId };
  }

  @SubscribeMessage('send_message')
  handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
    this.logger.log(`Tin nhắn mới trong phòng ${payload.roomId}: ${payload.text}`);
    
    // Broadcast to everyone in the room except sender (or all)
    this.server.to(payload.roomId).emit('receive_message', {
      ...payload,
      id: `msg_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    });

    return { status: 'sent' };
  }

  @SubscribeMessage('appointment_status_changed')
  handleAppointmentStatusChanged(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
    this.server.to(payload.roomId).emit('appointment_updated', payload);
    return { status: 'broadcasted' };
  }
}
