import 'package:flutter/material.dart';

enum WaycordNavView { today, inbox, recurring, schedule, settings, communities, account }

/// Backwards compatibility alias
typedef WaypointNavView = WaycordNavView;

class NavigationProvider with ChangeNotifier {
  String? _selectedCommunityId;
  String? _selectedCommunityName;
  String _currentRoute = '/';
  int _selectedIndex = 0; // 0: Personal, 1: Communities
  WaycordNavView _currentView = WaycordNavView.today;

  String? get selectedCommunityId => _selectedCommunityId;
  String? get selectedCommunityName => _selectedCommunityName;
  String get currentRoute => _currentRoute;
  int get selectedIndex => _selectedIndex;
  WaycordNavView get currentView => _currentView;

  void setView(WaycordNavView view) {
    _currentView = view;
    _selectedCommunityId = null;
    _selectedCommunityName = null;
    _selectedIndex = view == WaycordNavView.communities ? 1 : 0;

    if (view == WaycordNavView.today) {
      _currentRoute = '/';
    } else if (view == WaycordNavView.inbox) {
      _currentRoute = '/inbox';
    } else if (view == WaycordNavView.recurring) {
      _currentRoute = '/recurring';
    } else if (view == WaycordNavView.schedule) {
      _currentRoute = '/calendar';
    } else if (view == WaycordNavView.settings) {
      _currentRoute = '/settings';
    } else if (view == WaycordNavView.communities) {
      _currentRoute = '/communities';
    } else if (view == WaycordNavView.account) {
      _currentRoute = '/account';
    }
    notifyListeners();
  }

  void selectCommunity(String? id, {String? name}) {
    _selectedCommunityId = id;
    _selectedCommunityName = name;
    _currentRoute = '/';
    _selectedIndex = id != null ? 1 : 0;
    _currentView = WaycordNavView.today;
    notifyListeners();
  }

  void exitCommunity() {
    _selectedCommunityId = null;
    _selectedCommunityName = null;
    _selectedIndex = 0;
    _currentView = WaycordNavView.today;
    _currentRoute = '/';
    notifyListeners();
  }

  void setTab(int index) {
    _selectedIndex = index;
    _currentRoute = '/';
    _selectedCommunityId = null;
    _currentView = index == 0 ? WaycordNavView.today : WaycordNavView.communities;
    notifyListeners();
  }

  void setRoute(String route) {
    _currentRoute = route;
    if (route == '/') {
      _selectedIndex = 0;
      _selectedCommunityId = null;
      _currentView = WaycordNavView.today;
    } else if (route == '/calendar') {
      _currentView = WaycordNavView.schedule;
    } else if (route == '/settings') {
      _currentView = WaycordNavView.settings;
    } else if (route == '/categories' || route == '/communities') {
      _currentView = WaycordNavView.communities;
    } else if (route == '/account') {
      _currentView = WaycordNavView.account;
    }
    notifyListeners();
  }
}
