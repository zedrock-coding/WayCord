import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/entitlements/entitlement_capabilities.dart';
import '../core/entitlements/entitlement_service.dart';
import '../core/entitlements/waycord_upgrade_sheet.dart';
import '../features/voice/data/sherpa_tts_service.dart';
import '../models/hive_models.dart';
import '../notification_service.dart';
import '../services/navigation_provider.dart';
import '../services/sync_service.dart';
import '../theme/app_theme.dart';
import '../theme_provider.dart';
import '../widgets/feedback_dialog.dart';

class SettingsView extends StatefulWidget {
  const SettingsView({super.key});

  @override
  State<SettingsView> createState() => _SettingsViewState();
}

class _SettingsViewState extends State<SettingsView> {
  bool _voiceConfirmation = true;
  double _voiceSpeed = 1.05;
  bool _isTestingVoice = false;
  bool _isFlushingQueue = false;

  static const List<String> _fontSizeNames = [
    'Extra Small',
    'Small',
    'Medium',
    'Large',
    'Extra Large',
  ];

  static const List<double> _voiceSpeeds = [0.9, 1.0, 1.05, 1.2];

  Future<void> _handleNotificationToggle(
    String key,
    bool enabled,
    ThemeProvider provider,
  ) async {
    try {
      await provider.updateNotificationSetting(key, enabled);
      if (key == 'dueDateReminders' && !enabled) {
        await NotificationService().cancelAllNotifications();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update notification setting: $e')),
        );
      }
    }
  }

  Future<void> _testVoicePlayback() async {
    if (_isTestingVoice) return;
    setState(() => _isTestingVoice = true);
    try {
      final tts = SherpaTtsService(speed: _voiceSpeed);
      await tts.speak('Waycord voice assistant active.');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Voice test failed: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isTestingVoice = false);
      }
    }
  }

  Future<void> _flushSyncQueue() async {
    if (_isFlushingQueue) return;
    setState(() => _isFlushingQueue = true);
    try {
      await SyncService().processSyncQueue();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Offline sync queue processed successfully.')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Sync flush error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isFlushingQueue = false);
      }
    }
  }

  void _showShortcutsDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppTheme.surfaceContainerHigh,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4),
          side: const BorderSide(color: AppTheme.surfaceVariant),
        ),
        title: Row(
          children: [
            const Icon(Icons.keyboard_rounded, color: AppTheme.mint, size: 20),
            const SizedBox(width: 10),
            const Text(
              'Keyboard Shortcuts',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppTheme.onSurface,
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildShortcutRow('Ctrl + N', 'Create New Task'),
              _buildShortcutRow('Ctrl + F', 'Search Tasks'),
              _buildShortcutRow('Ctrl + Space', 'AI Voice Command'),
              _buildShortcutRow('Ctrl + Tab', 'Switch Tabs'),
              _buildShortcutRow('Alt + Enter', 'Quick Add Task'),
              _buildShortcutRow('Enter', 'Submit Form / Save'),
              _buildShortcutRow('Esc', 'Close Panel / Exit'),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'GOT IT',
              style: AppTheme.monoStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: AppTheme.mint,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShortcutRow(String keys, String action) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            action,
            style: const TextStyle(fontSize: 13, color: AppTheme.onSurface),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: AppTheme.surfaceContainer,
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: AppTheme.surfaceVariant),
            ),
            child: Text(
              keys,
              style: AppTheme.monoStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: AppTheme.mint,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _openUpdatesPage() async {
    final uri = Uri.parse('https://waycord.org');
    try {
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!launched && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open updates page')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error launching updates: $e')),
        );
      }
    }
  }

  Widget _buildCapabilityRow(String label, String value, bool isHighlight) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 12, color: AppTheme.onSurface),
        ),
        Text(
          value,
          style: AppTheme.monoStyle(
            fontSize: 10.5,
            fontWeight: FontWeight.bold,
            color: isHighlight ? AppTheme.mint : AppTheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }

  Widget _buildDevTierChip({
    required BuildContext context,
    required String label,
    required bool isSelected,
    required VoidCallback onSelected,
  }) {
    return InkWell(
      onTap: onSelected,
      borderRadius: BorderRadius.circular(4),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.mint.withValues(alpha: 0.2) : AppTheme.surfaceContainerHigh,
          borderRadius: BorderRadius.circular(4),
          border: Border.all(
            color: isSelected ? AppTheme.mint : AppTheme.surfaceVariant,
          ),
        ),
        child: Text(
          label,
          style: AppTheme.monoStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected ? AppTheme.mint : AppTheme.onSurfaceVariant,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();
    final navProvider = context.read<NavigationProvider>();
    final entitlement = context.watch<EntitlementService>();
    final activeTier = entitlement.activeTier;
    final capabilities = entitlement.capabilities;
    final settings = themeProvider.settings;
    final user = Supabase.instance.client.auth.currentUser;
    final email = user?.email ?? 'user@waycord.org';
    final metadata = user?.userMetadata;
    final displayName = metadata?['full_name'] as String? ?? '';
    final isDark = (settings.themeMode ?? 1) == 1;
    final currentFontIndex = (settings.fontSizeIndex ?? 2).clamp(0, 4);

    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 896),
        child: ListView(
          padding: const EdgeInsets.only(top: 16, bottom: 90),
          children: [
            // Header Eyebrow & Title
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        'PREFERENCES & SYSTEM',
                        style: AppTheme.monoStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.mint,
                          letterSpacing: 1.0,
                        ),
                      ),
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 6),
                        child: Text('•', style: TextStyle(color: AppTheme.surfaceVariant)),
                      ),
                      Text(
                        'Waycord Settings',
                        style: AppTheme.monoStyle(
                          fontSize: 11,
                          color: AppTheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Settings & Preferences',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.onSurface,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 2),
                  const Text(
                    'Customize appearance, notifications, speech synthesis, and local storage diagnostics.',
                    style: TextStyle(fontSize: 12, color: AppTheme.onSurfaceVariant),
                  ),
                  const SizedBox(height: 14),
                  const Divider(color: AppTheme.surfaceVariant, height: 1),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 1. Appearance & Font Scaling Box
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerHighColor(context),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppTheme.borderColor(context)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.palette_outlined, size: 18, color: AppTheme.mint),
                        const SizedBox(width: 8),
                        Text(
                          'Appearance & Font Scaling',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.text(context)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Configure visual theme mode and application-wide typography scaling.',
                      style: TextStyle(fontSize: 12, color: AppTheme.textMuted(context)),
                    ),
                    const SizedBox(height: 14),
                    // Theme Mode Toggles
                    Row(
                      children: [
                        Expanded(
                          child: InkWell(
                            onTap: () => themeProvider.updateThemeMode(1),
                            borderRadius: BorderRadius.circular(4),
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: isDark
                                    ? AppTheme.mint.withValues(alpha: 0.15)
                                    : AppTheme.surfaceContainerColor(context),
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(
                                  color: isDark ? AppTheme.mint : AppTheme.borderColor(context),
                                ),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.dark_mode_rounded,
                                    size: 16,
                                    color: isDark ? AppTheme.mint : AppTheme.textMuted(context),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Dark (Obsidian)',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: isDark ? FontWeight.w600 : FontWeight.w400,
                                      color: isDark ? AppTheme.mint : AppTheme.text(context),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: InkWell(
                            onTap: () => themeProvider.updateThemeMode(0),
                            borderRadius: BorderRadius.circular(4),
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: !isDark
                                    ? AppTheme.mint.withValues(alpha: 0.15)
                                    : AppTheme.surfaceContainerColor(context),
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(
                                  color: !isDark ? AppTheme.mint : AppTheme.borderColor(context),
                                ),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.light_mode_rounded,
                                    size: 16,
                                    color: !isDark ? AppTheme.mint : AppTheme.textMuted(context),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Light',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: !isDark ? FontWeight.w600 : FontWeight.w400,
                                      color: !isDark ? AppTheme.mint : AppTheme.text(context),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Font Scaling Selector
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceContainerColor(context),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: AppTheme.borderColor(context)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'App Font Size',
                                style: TextStyle(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w500,
                                  color: AppTheme.text(context),
                                ),
                              ),
                              Text(
                                'Global text scaling ratio (${AppTheme.fontScales[currentFontIndex]}x)',
                                style: AppTheme.monoStyle(fontSize: 10, color: AppTheme.textMuted(context)),
                              ),
                            ],
                          ),
                          DropdownButtonHideUnderline(
                            child: DropdownButton<int>(
                              value: currentFontIndex,
                              dropdownColor: AppTheme.surfaceContainerHighColor(context),
                              icon: const Icon(Icons.arrow_drop_down, color: AppTheme.mint),
                              style: AppTheme.monoStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AppTheme.mint,
                              ),
                              items: List.generate(
                                _fontSizeNames.length,
                                (index) => DropdownMenuItem(
                                  value: index,
                                  child: Text(_fontSizeNames[index]),
                                ),
                              ),
                              onChanged: (val) {
                                if (val != null) {
                                  themeProvider.updateFontSize(val);
                                }
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 14),

            // 2. Notifications Box
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerHighColor(context),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppTheme.borderColor(context)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.notifications_outlined, size: 18, color: AppTheme.mint),
                        const SizedBox(width: 8),
                        Text(
                          'Notifications & Reminders',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.text(context)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    SwitchListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      title: Text('Task Assignments', style: TextStyle(fontSize: 12.5, color: AppTheme.text(context))),
                      subtitle: Text('Notify when someone delegates a task to you', style: AppTheme.monoStyle(fontSize: 10.5, color: AppTheme.textMuted(context))),
                      value: settings.taskAssignmentsEnabled ?? true,
                      activeTrackColor: AppTheme.mint,
                      onChanged: (v) => _handleNotificationToggle('taskAssignments', v, themeProvider),
                    ),
                    Divider(color: AppTheme.borderColor(context), height: 1),
                    SwitchListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      title: Text('Due Date Reminders', style: TextStyle(fontSize: 12.5, color: AppTheme.text(context))),
                      subtitle: Text('Alert before due date and overdue deadlines', style: AppTheme.monoStyle(fontSize: 10.5, color: AppTheme.textMuted(context))),
                      value: settings.dueDateRemindersEnabled ?? true,
                      activeTrackColor: AppTheme.mint,
                      onChanged: (v) => _handleNotificationToggle('dueDateReminders', v, themeProvider),
                    ),
                    Divider(color: AppTheme.borderColor(context), height: 1),
                    SwitchListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      title: Text('Community Mentions', style: TextStyle(fontSize: 12.5, color: AppTheme.text(context))),
                      subtitle: Text('Alert when mentioned in workspace discussions', style: AppTheme.monoStyle(fontSize: 10.5, color: AppTheme.textMuted(context))),
                      value: settings.communityMentionsEnabled ?? true,
                      activeTrackColor: AppTheme.mint,
                      onChanged: (v) => _handleNotificationToggle('communityMentions', v, themeProvider),
                    ),
                    // Diagnostic Banner for NotificationService().lastError
                    ValueListenableBuilder<String?>(
                      valueListenable: NotificationService().lastError,
                      builder: (context, error, _) {
                        if (error == null || error.isEmpty) return const SizedBox.shrink();
                        return Container(
                          margin: const EdgeInsets.only(top: 10),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppTheme.priorityHigh.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: AppTheme.priorityHigh.withValues(alpha: 0.35)),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.warning_amber_rounded, color: AppTheme.priorityHigh, size: 18),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'NOTIFICATION DIAGNOSTIC WARNING',
                                      style: AppTheme.monoStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: AppTheme.priorityHigh,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      error,
                                      style: const TextStyle(fontSize: 11.5, color: AppTheme.onSurface),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 14),

            // 3. AI Voice Assistant Box
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerHigh,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppTheme.surfaceVariant),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.mic_rounded, size: 18, color: AppTheme.mint),
                        const SizedBox(width: 8),
                        const Text(
                          'AI Voice Assistant',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.onSurface),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Waycord synthesizes speech confirmations and extracts tasks from spoken dictation.',
                      style: TextStyle(fontSize: 12, color: AppTheme.onSurfaceVariant),
                    ),
                    const SizedBox(height: 14),
                    // Voice Confirmation Toggle
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceContainer,
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: AppTheme.surfaceVariant),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Voice Confirmation',
                                style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w500, color: AppTheme.onSurface),
                              ),
                              Text('Speak back verified task details', style: AppTheme.monoStyle(fontSize: 10, color: AppTheme.onSurfaceVariant)),
                            ],
                          ),
                          Switch(
                            value: _voiceConfirmation,
                            activeTrackColor: AppTheme.mint,
                            onChanged: (val) => setState(() => _voiceConfirmation = val),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Voice Speed Selection Chips
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceContainer,
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: AppTheme.surfaceVariant),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Voice Playback Speed',
                                style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w500, color: AppTheme.onSurface),
                              ),
                              Text(
                                '${_voiceSpeed}x',
                                style: AppTheme.monoStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.mint),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: _voiceSpeeds.map((speed) {
                              final isSelected = (_voiceSpeed - speed).abs() < 0.01;
                              return Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 3),
                                  child: InkWell(
                                    onTap: () => setState(() => _voiceSpeed = speed),
                                    borderRadius: BorderRadius.circular(4),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(vertical: 8),
                                      alignment: Alignment.center,
                                      decoration: BoxDecoration(
                                        color: isSelected
                                            ? AppTheme.mint.withValues(alpha: 0.15)
                                            : AppTheme.surfaceContainerHigh,
                                        borderRadius: BorderRadius.circular(4),
                                        border: Border.all(
                                          color: isSelected ? AppTheme.mint : AppTheme.surfaceVariant,
                                        ),
                                      ),
                                      child: Text(
                                        '${speed}x',
                                        style: AppTheme.monoStyle(
                                          fontSize: 11,
                                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                          color: isSelected ? AppTheme.mint : AppTheme.onSurfaceVariant,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Test Voice Playback Button
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: _isTestingVoice ? null : _testVoicePlayback,
                        icon: _isTestingVoice
                            ? const SizedBox(
                                width: 14,
                                height: 14,
                                child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.mint),
                              )
                            : const Icon(Icons.volume_up_rounded, size: 16, color: AppTheme.mint),
                        label: Text(
                          _isTestingVoice ? 'PLAYING TEST AUDIO...' : 'TEST VOICE PLAYBACK',
                          style: AppTheme.monoStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.mint,
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppTheme.surfaceVariant),
                          backgroundColor: AppTheme.surfaceContainer,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 14),

            // 4. Local Storage & Sync Diagnostics Box
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerHigh,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppTheme.surfaceVariant),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.dns_outlined, size: 18, color: AppTheme.mint),
                        const SizedBox(width: 8),
                        const Text(
                          'Local Storage & Sync Diagnostics',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.onSurface),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Live telemetry of local Hive database boxes and pending cloud synchronization actions.',
                      style: TextStyle(fontSize: 12, color: AppTheme.onSurfaceVariant),
                    ),
                    const SizedBox(height: 14),
                    // Cached Tasks Diagnostic
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceContainer,
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: AppTheme.surfaceVariant),
                      ),
                      child: ValueListenableBuilder<Box<Task>>(
                        valueListenable: Hive.box<Task>('tasks').listenable(),
                        builder: (context, box, _) {
                          return Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Local Hive Task Cache',
                                    style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w500, color: AppTheme.onSurface),
                                  ),
                                  Text(
                                    'Embedded offline storage (tasks box)',
                                    style: AppTheme.monoStyle(fontSize: 10, color: AppTheme.onSurfaceVariant),
                                  ),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppTheme.mint.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(2),
                                  border: Border.all(color: AppTheme.mint.withValues(alpha: 0.3)),
                                ),
                                child: Text(
                                  '${box.length} TASKS',
                                  style: AppTheme.monoStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.mint,
                                  ),
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 10),
                    // Pending Queue Diagnostic
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceContainer,
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: AppTheme.surfaceVariant),
                      ),
                      child: ValueListenableBuilder<int>(
                        valueListenable: SyncService().pendingChanges,
                        builder: (context, pending, _) {
                          final hasPending = pending > 0;
                          return Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Pending Offline Queue',
                                    style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w500, color: AppTheme.onSurface),
                                  ),
                                  Text(
                                    hasPending
                                        ? '$pending mutation(s) awaiting cloud flush'
                                        : 'Zero pending writes • Fully synchronized',
                                    style: AppTheme.monoStyle(
                                      fontSize: 10,
                                      color: hasPending ? AppTheme.priorityHigh : AppTheme.onSurfaceVariant,
                                    ),
                                  ),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: hasPending
                                      ? AppTheme.priorityHigh.withValues(alpha: 0.15)
                                      : AppTheme.surfaceContainerHigh,
                                  borderRadius: BorderRadius.circular(2),
                                  border: Border.all(
                                    color: hasPending ? AppTheme.priorityHigh : AppTheme.surfaceVariant,
                                  ),
                                ),
                                child: Text(
                                  '$pending QUEUED',
                                  style: AppTheme.monoStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: hasPending ? AppTheme.priorityHigh : AppTheme.onSurfaceVariant,
                                  ),
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Flush Queue Now Button
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: _isFlushingQueue ? null : _flushSyncQueue,
                        icon: _isFlushingQueue
                            ? const SizedBox(
                                width: 14,
                                height: 14,
                                child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.mint),
                              )
                            : const Icon(Icons.sync_rounded, size: 16, color: AppTheme.mint),
                        label: Text(
                          _isFlushingQueue ? 'FLUSHING SYNC QUEUE...' : 'FLUSH QUEUE NOW',
                          style: AppTheme.monoStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.mint,
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppTheme.surfaceVariant),
                          backgroundColor: AppTheme.surfaceContainer,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 14),

            // 5. Account & Profile Box
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerHigh,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppTheme.surfaceVariant),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.manage_accounts_outlined, size: 18, color: AppTheme.mint),
                        const SizedBox(width: 8),
                        const Text(
                          'Account & Profile',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.onSurface),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: AppTheme.surfaceContainer,
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: AppTheme.surfaceVariant),
                          ),
                          child: Center(
                            child: Text(
                              email.isNotEmpty ? email.substring(0, 1).toUpperCase() : 'U',
                              style: AppTheme.monoStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.mint,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                displayName.isNotEmpty ? displayName : email,
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.onSurface),
                              ),
                              Text(
                                email,
                                style: AppTheme.monoStyle(fontSize: 10.5, color: AppTheme.onSurfaceVariant),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppTheme.mint.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(2),
                          ),
                          child: Text(
                            'CONNECTED',
                            style: AppTheme.monoStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.mint),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () {
                          navProvider.setView(WaycordNavView.account);
                        },
                        icon: const Icon(Icons.person_outline_rounded, size: 16, color: AppTheme.mint),
                        label: Text(
                          'MANAGE ACCOUNT',
                          style: AppTheme.monoStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.mint,
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppTheme.surfaceVariant),
                          backgroundColor: AppTheme.surfaceContainer,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 14),

            // 6. Subscription & Capabilities Box
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerHigh,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppTheme.surfaceVariant),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.workspace_premium_outlined, size: 18, color: AppTheme.mint),
                        const SizedBox(width: 8),
                        const Text(
                          'Subscription & Capabilities',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.onSurface),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: activeTier == WaycordTier.free
                                ? AppTheme.surfaceVariant
                                : AppTheme.mint.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(2),
                            border: Border.all(
                              color: activeTier == WaycordTier.free
                                  ? AppTheme.surfaceVariant
                                  : AppTheme.mint.withValues(alpha: 0.35),
                            ),
                          ),
                          child: Text(
                            activeTier.displayName.toUpperCase(),
                            style: AppTheme.monoStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: activeTier == WaycordTier.free
                                  ? AppTheme.onSurfaceVariant
                                  : AppTheme.mint,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Capability-based tier access rules and limits for this account.',
                      style: TextStyle(fontSize: 12, color: AppTheme.onSurfaceVariant),
                    ),
                    const SizedBox(height: 14),
                    // Capability badges / rows
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceContainer,
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: AppTheme.surfaceVariant),
                      ),
                      child: Column(
                        children: [
                          _buildCapabilityRow(
                            'Custom Recurrence',
                            capabilities.canUseCustomRecurrence ? 'UNLOCKED' : 'LOCKED (DAILY/WEEKLY ONLY)',
                            capabilities.canUseCustomRecurrence,
                          ),
                          const Divider(color: AppTheme.surfaceVariant, height: 16),
                          _buildCapabilityRow(
                            'Needle AI Voice Calls',
                            capabilities.monthlyCloudAiLimit == -1 ? 'UNLIMITED' : '${capabilities.monthlyCloudAiLimit} / MONTH',
                            capabilities.monthlyCloudAiLimit == -1,
                          ),
                          const Divider(color: AppTheme.surfaceVariant, height: 16),
                          _buildCapabilityRow(
                            'Active Workspaces',
                            capabilities.maxWorkspaces == -1 ? 'UNLIMITED' : 'MAX ${capabilities.maxWorkspaces}',
                            capabilities.maxWorkspaces == -1,
                          ),
                          const Divider(color: AppTheme.surfaceVariant, height: 16),
                          _buildCapabilityRow(
                            'Members Per Workspace',
                            capabilities.maxMembersPerWorkspace == -1 ? 'UNLIMITED' : 'MAX ${capabilities.maxMembersPerWorkspace}',
                            capabilities.maxMembersPerWorkspace > 5,
                          ),
                          const Divider(color: AppTheme.surfaceVariant, height: 16),
                          _buildCapabilityRow(
                            '30-Day Trash Recovery',
                            capabilities.canRecoverTrash ? 'ENABLED' : 'LOCKED',
                            capabilities.canRecoverTrash,
                          ),
                          const Divider(color: AppTheme.surfaceVariant, height: 16),
                          _buildCapabilityRow(
                            '3-Tier Weighted RBAC',
                            capabilities.canUseWeightedRbac ? 'ENABLED' : 'LOCKED',
                            capabilities.canUseWeightedRbac,
                          ),
                        ],
                      ),
                    ),
                    if (activeTier == WaycordTier.free) ...[
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          onPressed: () => WaycordUpgradeSheet.show(
                            context,
                            featureName: 'Waycord Pro Tier',
                            description: 'Unlock custom recurrence, unlimited cloud AI runs, unlimited workspaces, and 30-day trash recovery.',
                          ),
                          icon: const Icon(Icons.star_rounded, size: 16, color: AppTheme.mint),
                          label: Text(
                            'UPGRADE TO PRO',
                            style: AppTheme.monoStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.mint,
                            ),
                          ),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppTheme.mint),
                            backgroundColor: AppTheme.mint.withValues(alpha: 0.1),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          ),
                        ),
                      ),
                    ],
                    if (kDebugMode) ...[
                      const SizedBox(height: 14),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceContainer,
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: AppTheme.priorityHigh.withValues(alpha: 0.3)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.bug_report_outlined, size: 15, color: AppTheme.priorityHigh),
                                const SizedBox(width: 6),
                                Text(
                                  'DEVELOPER TIER OVERRIDE (DEBUG)',
                                  style: AppTheme.monoStyle(
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.priorityHigh,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Test tier gating and capabilities immediately with a single tap.',
                              style: AppTheme.monoStyle(fontSize: 10, color: AppTheme.onSurfaceVariant),
                            ),
                            const SizedBox(height: 10),
                            Wrap(
                              spacing: 8,
                              runSpacing: 6,
                              children: [
                                _buildDevTierChip(
                                  context: context,
                                  label: 'Default',
                                  isSelected: entitlement.devOverrideTier == null,
                                  onSelected: () => entitlement.setDevOverrideTier(null),
                                ),
                                _buildDevTierChip(
                                  context: context,
                                  label: 'Free',
                                  isSelected: entitlement.devOverrideTier == WaycordTier.free,
                                  onSelected: () => entitlement.setDevOverrideTier(WaycordTier.free),
                                ),
                                _buildDevTierChip(
                                  context: context,
                                  label: 'Pro',
                                  isSelected: entitlement.devOverrideTier == WaycordTier.pro,
                                  onSelected: () => entitlement.setDevOverrideTier(WaycordTier.pro),
                                ),
                                _buildDevTierChip(
                                  context: context,
                                  label: 'Team',
                                  isSelected: entitlement.devOverrideTier == WaycordTier.team,
                                  onSelected: () => entitlement.setDevOverrideTier(WaycordTier.team),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),

            const SizedBox(height: 14),

            // 6. System, Shortcuts & About Box
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerHigh,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppTheme.surfaceVariant),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.tune_rounded, size: 18, color: AppTheme.mint),
                        const SizedBox(width: 8),
                        const Text(
                          'System & Application Info',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.onSurface),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    ListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(Icons.keyboard_outlined, color: AppTheme.mint, size: 20),
                      title: const Text('Keyboard Shortcuts', style: TextStyle(fontSize: 13, color: AppTheme.onSurface)),
                      subtitle: Text('View navigation, command bar, and action hotkeys', style: AppTheme.monoStyle(fontSize: 10)),
                      trailing: const Icon(Icons.chevron_right_rounded, color: AppTheme.onSurfaceVariant),
                      onTap: _showShortcutsDialog,
                    ),
                    const Divider(color: AppTheme.surfaceVariant, height: 1),
                    ListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(Icons.system_update_alt_rounded, color: AppTheme.mint, size: 20),
                      title: const Text('Check for Updates', style: TextStyle(fontSize: 13, color: AppTheme.onSurface)),
                      subtitle: Text('Review latest releases on GitHub repository', style: AppTheme.monoStyle(fontSize: 10)),
                      trailing: const Icon(Icons.open_in_new_rounded, color: AppTheme.onSurfaceVariant, size: 18),
                      onTap: _openUpdatesPage,
                    ),
                    const Divider(color: AppTheme.surfaceVariant, height: 1),
                    ListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(Icons.info_outline_rounded, color: AppTheme.mint, size: 20),
                      title: const Text('About Waycord', style: TextStyle(fontSize: 13, color: AppTheme.onSurface)),
                      subtitle: Text('Version details, architecture, and legal licenses', style: AppTheme.monoStyle(fontSize: 10)),
                      trailing: const Icon(Icons.chevron_right_rounded, color: AppTheme.onSurfaceVariant),
                      onTap: () => Navigator.pushNamed(context, '/about'),
                    ),
                    const Divider(color: AppTheme.surfaceVariant, height: 1),
                    ListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(Icons.chat_bubble_outline_rounded, color: AppTheme.mint, size: 20),
                      title: const Text('Send Feedback & Bug Report', style: TextStyle(fontSize: 13, color: AppTheme.onSurface)),
                      subtitle: Text('Report bugs, request features, or send thoughts', style: AppTheme.monoStyle(fontSize: 10)),
                      trailing: const Icon(Icons.chevron_right_rounded, color: AppTheme.onSurfaceVariant),
                      onTap: () => showFeedbackDialog(context),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
