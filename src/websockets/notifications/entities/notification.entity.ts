export class Notification<T> {
  constructor(
    public entity: string,
    public type: NotificationType,
    public data: T,
    public createdAt: Date,
  ) {}
}

export enum NotificationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}
