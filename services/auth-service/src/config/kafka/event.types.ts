export interface UserCreatedEvent {
  userId: string;
  email: string;
}

export interface OrderCreatedEvent {
  orderId: string;
  userId: string;
  total: number;
}
