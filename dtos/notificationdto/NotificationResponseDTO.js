class NotificationResponseDTO {
  constructor(notification) {
    this.id = notification._id;
    this.title = notification.title;
    this.message = notification.message;
    this.type = notification.type;
    this.link = notification.link;
    this.isRead = notification.isRead;
    this.createdAt = notification.createdAt;
  }
}

module.exports = NotificationResponseDTO;
