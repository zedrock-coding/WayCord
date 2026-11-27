# Waycord v0.8.2 — Background Notifications, Widget Previews & Full Light Mode

> **v0.8.2** fixes background notification delivery, adds 2-hour advance due alerts and exact 9:00 AM morning dispatch alarms, introduces Android widget picker previews with clear widget labels, and completes light theme support across every screen.

---

## Key Fixes & Improvements

### 1. Background Notifications & 9:00 AM Morning Dispatch
* Registered `ScheduledNotificationReceiver` and `ScheduledNotificationBootReceiver` in `AndroidManifest.xml` for reliable delivery when the app is closed or after reboot.
* Added a 2-hour advance reminder slot in `NotificationService` (alongside 24-hour and 1-hour alerts).
* Scheduled an exact 9:00 AM daily alarm in `NeedleMorningDispatchService` using `AndroidScheduleMode.exactAllowWhileIdle`.

### 2. Android Widgets & Picker Previews
* Added static RemoteViews-compatible preview layouts (`widget_month_preview.xml`, `widget_priority_preview.xml`, `widget_agenda_preview.xml`) for the Android widget picker.
* Removed duplicate legacy `WaypointWidgetProvider` registration and labeled the widgets **Monthly Task List**, **Weekly Task List**, and **Daily Task List**.

### 3. Complete Light Mode & UI Polish
* Updated `CommandBarWidget`, `ScheduleView`, `AccountView`, `SettingsView`, `InboxView`, `RecurringView`, `CommunitiesOverviewView`, `TaskItemCard`, and `AppTheme.monoStyle` to adapt text, icons, and surfaces to `ThemeMode.light`.
* Added dynamic `SystemChrome.setSystemUIOverlayStyle` updates and top `SafeArea` in `AppShell` to prevent status bar overlap.
* Optimized `TaskCreationDrawer` with `RepaintBoundary` and `AnimatedPadding`.
