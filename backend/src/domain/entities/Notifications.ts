import { generateUUID } from "./utils";

export enum NotificationType {
  OFFER_CREATED = "OFFER_CREATED",
  OFFER_ACCEPTED = "OFFER_ACCEPTED", 
  OFFER_REJECTED = "OFFER_REJECTED"
}

export interface NotificationProps {
  id?: string;
  userId: string;
  message: string;
  offerId: string;
  type: NotificationType;
  seen?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Notifications {
  private readonly id: string;
  private userId: string;
  private message: string;
  private offerId: string;
  private type: NotificationType;
  private seen: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: NotificationProps) {
    this.id = props.id || generateUUID();
    this.userId = props.userId;
    this.message = props.message;
    this.offerId = props.offerId;
    this.type = props.type;
    this.seen = props.seen || false;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getMessage(): string {
    return this.message;
  }

  public getOfferId(): string {
    return this.offerId;
  }

  public getType(): NotificationType {
    return this.type;
  }

  public getSeen(): boolean {
    return this.seen;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Setters
  public setSeen(seen: boolean): void {
    this.seen = seen;
    this.updatedAt = new Date();
  }

  public markAsSeen(): void {
    this.setSeen(true);
  }

  // To plain object for data transfer
  public toJSON(): NotificationProps {
    return {
      id: this.id,
      userId: this.userId,
      message: this.message,
      offerId: this.offerId,
      type: this.type,
      seen: this.seen,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
