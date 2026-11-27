import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'models/hive_models.dart';
import 'theme/app_theme.dart';

class ThemeProvider with ChangeNotifier {
  final Box<Settings> _settingsBox = Hive.box<Settings>('settings');
  Settings _settings = Settings();

  ThemeProvider() {
    _init();
  }

  Settings get settings => _settings;

  bool get hasSeenOnboarding {
    return _settings.onboardingComplete ?? false;
  }

  void _init() {
    final s = _settingsBox.get('app_settings');
    if (s != null) {
      _settings = s;
    }
    AppTheme.isLightGlobal = (_settings.themeMode ?? 1) == 0;
    
    // Listen for changes
    _settingsBox.watch(key: 'app_settings').listen((event) {
      if (event.value != null) {
        _settings = event.value;
        AppTheme.isLightGlobal = (_settings.themeMode ?? 1) == 0;
        notifyListeners();
      }
    });
  }

  ThemeMode get themeMode {
    final mode = (_settings.themeMode ?? 1) == 1 ? ThemeMode.dark : ThemeMode.light;
    AppTheme.isLightGlobal = mode == ThemeMode.light;
    return mode;
  }

  double get textScaleFactor {
    return AppTheme.fontScales[(_settings.fontSizeIndex ?? 2).clamp(0, 4)];
  }

  Future<void> updateThemeMode(int mode) async {
    _settings.themeMode = mode;
    AppTheme.isLightGlobal = mode == 0;
    if (_settings.isInBox) {
      await _settings.save();
    } else {
      await _settingsBox.put('app_settings', _settings);
    }
    notifyListeners();
  }
  
  Future<void> updateFontSize(int index) async {
    _settings.fontSizeIndex = index;
    await _settings.save();
    notifyListeners();
  }

  Future<void> toggleReminders(bool enabled) async {
    _settings.dailyBriefingEnabled = enabled;
    await _settings.save();
    notifyListeners();
  }

  Future<void> updateNotificationSetting(String key, bool value) async {
    switch (key) {
      case 'taskAssignments':
        _settings.taskAssignmentsEnabled = value;
        break;
      case 'dueDateReminders':
        _settings.dueDateRemindersEnabled = value;
        break;
      case 'communityMentions':
        _settings.communityMentionsEnabled = value;
        break;
      case 'dailyBriefing':
        _settings.dailyBriefingEnabled = value;
        break;
      case 'newsAndOffers':
        _settings.newsAndOffersEnabled = value;
        break;
    }
    await _settings.save();
    notifyListeners();
  }

  void refresh() {
    notifyListeners();
  }

  Future<void> acceptLegal() async {
    _settings.legalAccepted = true;
    await _settings.save();
    notifyListeners();
  }

  Future<void> completeOnboarding() async {
    _settings.onboardingComplete = true;
    await _settings.save();
    notifyListeners();
  }
}
