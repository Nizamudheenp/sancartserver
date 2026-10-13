class UpdateNotificationPreferencesDTO {
  constructor(body) {
    if (body.emailNotifications !== undefined) {
      this.emailNotifications = Boolean(body.emailNotifications);
    }
    if (body.inAppNotifications !== undefined) {
      this.inAppNotifications = Boolean(body.inAppNotifications);
    }
  }
}

module.exports = UpdateNotificationPreferencesDTO;
