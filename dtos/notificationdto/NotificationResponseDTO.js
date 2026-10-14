class NotificationResponseDTO {
  constructor(notification) {
    this.id = notification._id;
    this.recipient = notification.recipient;
    this.forAdmin = notification.forAdmin;
    this.title = notification.title;
    this.message = notification.message;
    this.type = notification.type;
    this.link = notification.link;
    this.isRead = notification.isRead;
    this.metadata = notification.metadata || {};
    this.createdAt = notification.createdAt;
  }
}

module.exports = NotificationResponseDTO;
